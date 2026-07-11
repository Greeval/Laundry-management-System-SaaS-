// utils/helpers.js

/**
 * Returns formatted service details (name, styling color class, and price)
 * 
 * @param {string} serviceType - The service_type enum string from database
 * @param {object} settings - The laundry_settings object for the current tenant
 * @returns {object} { name, color, price }
 */
exports.getServiceDetails = (serviceType, settings) => {
    let name = 'Reguler';
    let color = 'bg-secondary-container text-on-secondary-container';
    let price = settings ? parseFloat(settings.price_per_kg) : 0;
    
    if (serviceType === 'express') {
        name = 'Express';
        color = 'bg-error-container text-error';
        if (settings) price = parseFloat(settings.express_price_per_kg) || price;
    } else if (serviceType === 'cuci') {
        name = 'Cuci';
        color = 'bg-primary-container text-on-primary-container';
        if (settings) price = parseFloat(settings.cuci_price_per_kg) || price;
    } else if (serviceType === 'cuci_kering') {
        name = 'Cuci Kering';
        color = 'bg-tertiary-container text-on-tertiary-container';
        if (settings) price = parseFloat(settings.cuci_kering_price_per_kg) || price;
    } else if (serviceType === 'cuci_setrika') {
        name = 'Cuci Setrika';
        color = 'bg-primary-container text-on-primary-container';
        if (settings) price = parseFloat(settings.cuci_setrika_price_per_kg) || price;
    }

    return { name, color, price };
};

/**
 * Formats a number to Rupiah string format
 * 
 * @param {number} number 
 * @returns {string} Formatted string like "Rp 10.000"
 */
exports.formatRupiah = (number) => {
    return 'Rp ' + Number(number).toLocaleString('id-ID');
};
