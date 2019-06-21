window.calculator = {
    add: (a, b) => a + b,
    multiply: (a, b) => a * b,
    divison: (a, b) => {
        if (b === 0) {
            throw new Error('Divide by 0');
        }
        return a / b;
    }
};
