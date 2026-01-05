export const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 2
    }).format(val || 0);
};

export const numberToWords = (num) => {
    if (num === 0) return "Zero";

    const a = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const inWords = (n) => {
        if (n < 20) return a[n];
        const digit = n % 10;
        if (n < 100) return b[Math.floor(n / 10)] + (digit ? " " + a[digit] : "");
        if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 === 0 ? "" : " " + inWords(n % 100));
        return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + inWords(n % 1000) : "");
    };

    const integerPart = Math.floor(Math.abs(num));
    return inWords(integerPart) + " Only";
};
