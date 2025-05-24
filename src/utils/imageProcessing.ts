
export const convertToJpeg = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Definir dimensões do canvas
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (!ctx) {
        reject(new Error('Não foi possível obter o contexto do canvas'));
        return;
      }
      
      // Desenhar a imagem no canvas
      ctx.drawImage(img, 0, 0);
      
      // Converter para JPEG
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Não foi possível converter a imagem'));
        }
      }, 'image/jpeg', 0.85);
    };
    
    img.onerror = () => {
      reject(new Error('Erro ao carregar a imagem'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};
