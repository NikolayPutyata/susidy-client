// Product and banner photos live on Cloudinary and are stored at whatever
// size the admin uploaded. Cloudinary can resize and re-encode on the fly
// from the URL alone: inserting `f_auto,q_auto,c_limit,w_<px>` after
// `/upload/` serves WebP/AVIF at a sensible quality, never wider than asked
// (and never upscaled). Each variant is generated once and then cached on
// Cloudinary's CDN, so the same few widths are reused across the site.
const UPLOAD_SEGMENT = '/image/upload/'

const isCloudinary = (url) =>
  typeof url === 'string' && url.includes('res.cloudinary.com') && url.includes(UPLOAD_SEGMENT)

export const cloudinaryUrl = (url, width) => {
  if (!isCloudinary(url)) return url
  return url.replace(UPLOAD_SEGMENT, `${UPLOAD_SEGMENT}f_auto,q_auto,c_limit,w_${width}/`)
}

// src/srcSet/sizes for an <img>: the browser picks the smallest variant
// that still looks sharp for the slot's rendered width and the screen's
// pixel density. Non-Cloudinary URLs pass through untouched.
export const responsiveImage = (url, { widths, sizes }) => {
  if (!isCloudinary(url)) return { src: url }
  return {
    src: cloudinaryUrl(url, widths[widths.length - 1]),
    srcSet: widths.map((w) => `${cloudinaryUrl(url, w)} ${w}w`).join(', '),
    sizes,
  }
}
