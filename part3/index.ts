type Bindings = {
  images: R2Bucket
}

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { etag } from 'hono/etag'

const app = new Hono<{Bindings: Bindings}>()
app.use('*', cors(), etag())

app.post('/upload', async (context) => {
  const formData = await context.req.formData()
  const file = formData.get('image') as unknown as File

  const ext = file.name.split('.').pop()
  const id = Date.now().toString() + '.' + ext

  await context.env.images.put(id, await file.arrayBuffer())

  return context.json({ message: 'ok', id: id }, 200)
})

app.get('/:id', async (context) => {
  const id = context.req.param('id')
  const body = await context.env.images.get(id)
  if (!body) return context.json({ error: 'not found' }, 404)

  return context.body(body.body, 200)
})

app.delete('/:id', async (context) => {
  const id = context.req.param('id')
  const body = await context.env.images.get(id)
  if (!body) return context.json({ error: 'not found' }, 404)

  await context.env.images.delete(id)
  return context.json({ message: 'ok' }, 200)
})

export default app