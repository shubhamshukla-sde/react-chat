import CryptoJS from 'crypto-js';

const SECRET_CODE_SESSION_KEY = 'chatAppSecretCode';

const SecretCodeService = {
    hashSecretCode: (code) => {
        if (!code) return null;
        return CryptoJS.SHA256(code).toString();
    },

    setSecretCodeInSession: (hashedCode) => {
        if (hashedCode) {
            sessionStorage.setItem(SECRET_CODE_SESSION_KEY, hashedCode);
        } else {
            sessionStorage.removeItem(SECRET_CODE_SESSION_KEY);
        }
    },

    getSecretCodeFromSession: () => {
        return sessionStorage.getItem(SECRET_CODE_SESSION_KEY);
    },

    removeSecretCodeFromSession: () => {
        sessionStorage.removeItem(SECRET_CODE_SESSION_KEY);
    },

    verifySecretCode: (plainTextCode, storedHashedCode) => {
        if (!plainTextCode || !storedHashedCode) return false;
        return SecretCodeService.hashSecretCode(plainTextCode) === storedHashedCode;
    }
};

export default SecretCodeService; 