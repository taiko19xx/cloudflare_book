type Bindings = {
  DB: D1Database
}

export type Post = {
  datetime: number,
  text: string,
  lat?: string,
  lon?: string,
  location?: string,
  images?: string[]
}

export default {
  async queue(batch: MessageBatch<Post>, env: Bindings): Promise<void> {
    for (const message of batch.messages) {
      const body = message.body

      await env.DB.prepare(
			'INSERT INTO Details (id, text, lat, lon, location) VALUES (?, ?, ?, ?, ?)'
			).bind(body.datetime, body.text, body.lat, body.lon, body.location).run()

      if (body.images && body.images.length != 0) {
        const stmt = env.DB.prepare('INSERT INTO Images (detail_id, image) VALUES (?, ?)')
        await env.DB.batch(body.images.map((value: string) => stmt.bind(body.datetime.toString(), value)))
      }
    }
  }
}