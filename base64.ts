export const base64ToUtf8 = (base64String: string): string => {
  try {
    // Remove data URL prefix if present
    const base64 = base64String.includes(',') 
      ? base64String.split(',')[1] 
      : base64String;

    // Decode Base64 to binary string
    const binaryString = window.atob(base64);
    
    // Convert to byte array
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Decode as UTF-8
    return new TextDecoder().decode(bytes);
  } catch (e) {
    console.error("Base64 decode error", e);
    return "Error decoding file content.";
  }
};

export const downloadBase64 = (base64: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = base64;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};