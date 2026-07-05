// Compresse une image à 480px max, JPEG 0.72 (~50–150 KB).
// Appelé partout où l'utilisatrice choisit une photo (produits, recettes).
// onDone reçoit le dataUrl base64 résultant.
export function compressImage(file, onDone) {
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    const MAX   = 480
    const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
    const canvas = document.createElement('canvas')
    canvas.width  = Math.round(img.width  * ratio)
    canvas.height = Math.round(img.height * ratio)
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
    onDone(canvas.toDataURL('image/jpeg', 0.72))
    URL.revokeObjectURL(url)
  }
  img.src = url
}
