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

export const compressImage = (file) => {
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
                
                // Calculate new dimensions while maintaining aspect ratio
                const maxDimension = 800 // Maximum dimension for either width or height
                if (width > height && width > maxDimension) {
                    height = Math.round((height * maxDimension) / width)
                    width = maxDimension
                } else if (height > maxDimension) {
                    width = Math.round((width * maxDimension) / height)
                    height = maxDimension
                }

                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0, width, height)
                
                // Convert to base64 with reduced quality
                const base64String = canvas.toDataURL('image/jpeg', 0.7)
                resolve(base64String.split(',')[1])
            }
            img.onerror = reject
        }
        reader.onerror = reject
    })
} 