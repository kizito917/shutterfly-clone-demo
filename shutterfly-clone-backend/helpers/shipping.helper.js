const createShippingOrder = async (payload) => {
    try {
        const response = await fetch(`${process.env.PWINTY_API_BASE_URL}/Orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': process.env.PWINTY_API_KEY
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to create shipping order: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Unable to create shipping order:", err.message);
        throw err;
    }
}

module.exports = {
    createShippingOrder
}