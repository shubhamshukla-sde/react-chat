export const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            // Get the base64 string without the data URL prefix
            const base64String = reader.result.split(',')[1]
            resolve(base64String)
        }
        reader.onerror = (error) => reject(error)
    })
}

export const compressImage = async (file, isProfilePic = false) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target.result
            img.onload = () => {
                const canvas = document.createElement('canvas')
                let width = img.width
                let height = img.height

                // For profile pictures, use smaller dimensions
                if (isProfilePic) {
                    width = 200
                    height = 200
                } else {
                    // For chat images, use larger dimensions
                    const maxDimension = 800
                    if (width > height && width > maxDimension) {
                        height = Math.round((height * maxDimension) / width)
                        width = maxDimension
                    } else if (height > maxDimension) {
                        width = Math.round((width * maxDimension) / height)
                        height = maxDimension
                    }
                }

                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0, width, height)

                // Use lower quality for profile pictures
                const quality = isProfilePic ? 0.5 : 0.7
                const compressedImage = canvas.toDataURL('image/jpeg', quality)
                resolve(compressedImage)
            }
            img.onerror = (error) => {
                reject(error)
            }
        }
        reader.onerror = (error) => {
            reject(error)
        }
    })
} 