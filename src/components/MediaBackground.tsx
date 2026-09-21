type MediaBackgroundProps = {
  /** Imagem estática (uso atual) */
  imageSrc: string
  /** Quando definido, troca a imagem por vídeo em loop */
  videoSrc?: string
  posterSrc?: string
  alt?: string
}

/**
 * Camada de mídia full-bleed.
 * Hoje: imagem estática. Depois: passe `videoSrc` para ativar o vídeo
 * sem alterar o restante da tela.
 */
export function MediaBackground({
  imageSrc,
  videoSrc,
  posterSrc,
  alt = '',
}: MediaBackgroundProps) {
  return (
    <div className="media-bg" aria-hidden={alt ? undefined : true}>
      {videoSrc ? (
        <video
          className="media-bg__media"
          autoPlay
          muted
          loop
          playsInline
          poster={posterSrc ?? imageSrc}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        <img className="media-bg__media" src={imageSrc} alt={alt} />
      )}
      <div className="media-bg__veil" />
    </div>
  )
}
