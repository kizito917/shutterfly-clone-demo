export const products = [
    {
        name: 'Art Prints (Enhanced matte art paper)',
        description: 'A premium quality heavyweight fine art print material with a smooth, clean finish. This museum-quality paper is extremely consistent and works perfectly with large, full colour graphics or illustrations.',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        name: 'Wall arts (Framed prints)',
        description: 'Crafted from sustainably sourced wood and delivered ready to hang with a premium fine art print',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
]

export const productItems = [
    {
        parent: 'Art Prints (Enhanced matte art paper)',
        type: "Portrait/Landscape",
        sku: "GLOBAL-FAP-11x14",
        shippingPrice: 12.60,
        size: '11 X 14"'
    },
    {
        parent: 'Art Prints (Enhanced matte art paper)',
        type: "Portrait/Landscape",
        sku: "GLOBAL-FAP-12x24",
        shippingPrice: 18.90,
        size: '12 X 24"'
    },
    {
        parent: 'Art Prints (Enhanced matte art paper)',
        type: "Portrait/Landscape",
        sku: "GLOBAL-FAP-11x17",
        shippingPrice: 14.00,
        size: '11 X 17"'
    },
    {
        parent: 'Art Prints (Enhanced matte art paper)',
        type: "Portrait/Landscape",
        sku: "GLOBAL-FAP-12x16",
        shippingPrice: 14.50,
        size: '12 X 16"'
    },
    {
        parent: 'Wall arts (Framed prints)',
        type: "Portrait/Landscape",
        sku: "CFPM-20x28-AWLCRACY",
        shippingPrice: 90.00,
        size: '20 X 28"'
    },
    {
        parent: 'Wall arts (Framed prints)',
        type: "Portrait/Landscape",
        sku: "GLOBAL-CFP-11x14",
        shippingPrice: 42.50,
        size: '11 X 14"'
    },
    {
        parent: 'Wall arts (Framed prints)',
        type: "Portrait/Landscape",
        sku: "GLOBAL-CFP-11x17",
        shippingPrice: 47.60,
        size: '11 X 17"'
    },
    {
        parent: 'Wall arts (Framed prints)',
        type: "Portrait/Landscape",
        sku: "GLOBAL-CFP-12x16",
        shippingPrice: 49.30,
        size: '12 X 16"'
    },
    {
        parent: 'Wall arts (Framed prints)',
        type: "Square",
        sku: "GLOBAL-CFP-12x12",
        shippingPrice: 38.25,
        size: '12 X 12"'
    }
];