type Bindings = {
  DB: D1Database,
  MAP_API_KEY: string
}

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { etag } from 'hono/etag'

export type Post = {
  datetime: number,
  text: string,
  lat?: string,
  lon?: string,
  location?: string,
  images?: string[]
}

export type Param = {
  text: string,
  lat?: string,
  lon?: string,
  location?: string,
  images?: string[]
}

export type DetailDB = {
  id: number,
  text: string,
  lat?: string,
  lon?: string,
  location?: string,
}

export type ImageDB = {
  detail_id: number,
  image: string
}

const app = new Hono<{Bindings: Bindings}>()
app.use('*', cors(), etag())

app.get('/', async (context) => {
	const { results } = await context.env.DB.prepare('SELECT id FROM Details ORDER BY id desc').all<DetailDB>()
	const id_list = results?.map((data: DetailDB) => data.id)
  
	return context.json({ message: 'ok', data: id_list}, 200)
})

app.post('/post', async (context) => {
	try {
		const param = await context.req.json<Param>()
		
		if (!param.text) throw new Error('text is required');
	  
		const datetime = Math.floor(Date.now() / 1000)
	  
		const result = await context.env.DB.prepare(
			'INSERT INTO Details (id, text, lat, lon, location) VALUES (?, ?, ?, ?, ?)'
			).bind(datetime.toString(), param.text, param.lat, param.lon, param.location).run()

		if (!result.success) {
			return context.json({ message: 'register failed' }, 500)
		}

		if (param.images && param.images.length != 0) {
			const stmt = context.env.DB.prepare('INSERT INTO Images (detail_id, image) VALUES (?, ?)')
			await context.env.DB.batch(param.images.map((value: string) => stmt.bind(datetime.toString(), value)))
		}
	  
		return context.json({ message: 'ok' , id: datetime }, 200)
	} catch (e: any) {
		console.log(e.message)
		return context.json({ error: 'invalid request' }, 400)
	}
})

app.get('/post/:id', async (context) => {
	const id = context.req.param('id')
	const post = await context.env.DB.prepare('SELECT * FROM Details WHERE id = ?').bind(id).first<DetailDB>();

	if (typeof post === 'undefined') {
		return context.json({ error: 'not found' }, 404)
	}

	let images: string[] = [];

	const image_list = await context.env.DB.prepare('SELECT * FROM Images WHERE detail_id = ?').bind(id).all<ImageDB>();
	if (image_list && image_list.results) {
		images = image_list.results.map((value: ImageDB) => value.image)
	}

	const result_post: Post = {
		datetime: Number(id),
		text: post.text,
		lat: post.lat,
		lon: post.lon,
		location: post.location,
		images: images,
	}
  
	return context.json({ message: 'ok', data: result_post as Post }, 200)
})

app.delete('/post/:id', async (context) => {
	const id = context.req.param('id')
	const post = await context.env.DB.prepare('SELECT * FROM Details WHERE id = ?').bind(id).first<DetailDB>();

	if (typeof post === 'undefined') {
		return context.json({ error: 'not found' }, 404)
	}

	const image_result = await context.env.DB.prepare(
		'DELETE FROM Images WHERE detail_id = ?'
		).bind(id).run()

	if (!image_result.success) {
		return context.json({ message: 'delete failed' }, 500)
	}
  
	return context.json({ message: 'ok' }, 200)
})

app.get('/nearby/:lat/:lon', async (context) => {
	const lat = context.req.param('lat')
	const lon = context.req.param('lon')
	if (!(lat && lon)) return context.json({ error: 'invalid request' }, 400)

	type places = {
		results: {
		name: string
		}[]
	}

	const result = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=1500&key=${context.env.MAP_API_KEY}&language=ja`)

	const result_json = await result.json() as places
	const locations = result_json.results.map(n => n.name)

	return context.json({ message: 'ok', locations: locations }, 200)
})

export default app