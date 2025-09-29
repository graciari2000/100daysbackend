const generateId = () => {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
};

module.exports = generateId;