// Helper function to format file size
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Helper function to read text file
export const readTextFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const html = text
          .split('\n')
          .map(line => {
            if (line.trim() === '') {
              return '<p><br></p>';
            }
            if (line.trim().startsWith('#')) {
              const level = line.trim().match(/^#+/)?.[0].length || 1;
              const headingText = line.trim().substring(level).trim();
              return `<h${Math.min(level, 6)}>${headingText}</h${Math.min(level, 6)}>`;
            }
            return `<p>${line.trim()}</p>`;
          })
          .join('');
        resolve(html);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file, 'UTF-8');
  });
};

// Helper function to get current user ID from JWT token
export const getCurrentUserId = async (api) => {
  try {
    const response = await api.get('/api/test/current-user');
    if (response.data?.data?.userId) {
      return response.data.data.userId;
    }
    const token = localStorage.getItem('auth_token');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      const userId = decoded.userId || decoded.sub || decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.id;
      return parseInt(userId) || 1;
    }
  } catch (error) {
    console.error('Error getting current user ID:', error);
  }
  return 1;
};

