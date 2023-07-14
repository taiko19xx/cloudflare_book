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

export type Image = {
  idx: number,
  blob: File,
  url: string
}