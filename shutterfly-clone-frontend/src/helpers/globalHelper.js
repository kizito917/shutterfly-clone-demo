// Function to format date to readable format
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Function to format time to readable format
export const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${formatDate(dateString)} at ${date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
};