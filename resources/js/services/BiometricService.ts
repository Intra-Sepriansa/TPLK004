class BiometricService {
    private isAvailable: boolean = false;

    constructor() {
        this.checkAvailability();
    }

    async checkAvailability(): Promise<boolean> {
        if (!window.PublicKeyCredential) {
            this.isAvailable = false;
            return false;
        }
        try {
            const available =
                await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            this.isAvailable = available;
            return available;
        } catch {
            this.isAvailable = false;
            return false;
        }
    }

    async register(userId: string): Promise<boolean> {
        if (!this.isAvailable) return false;
        try {
            const challenge = await this.getChallenge();
            const credential = (await navigator.credentials.create({
                publicKey: {
                    challenge: Uint8Array.from(challenge, (c) =>
                        c.charCodeAt(0),
                    ),
                    rp: {
                        name: 'Attendance System',
                        id: window.location.hostname,
                    },
                    user: {
                        id: Uint8Array.from(userId, (c) => c.charCodeAt(0)),
                        name: userId,
                        displayName: 'User',
                    },
                    pubKeyCredParams: [
                        { alg: -7, type: 'public-key' },
                        { alg: -257, type: 'public-key' },
                    ],
                    authenticatorSelection: {
                        authenticatorAttachment: 'platform',
                        userVerification: 'required',
                    },
                    timeout: 60000,
                    attestation: 'direct',
                },
            })) as PublicKeyCredential;
            if (credential) {
                localStorage.setItem('biometric_credential_id', credential.id);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Biometric registration failed:', error);
            return false;
        }
    }

    async authenticate(): Promise<boolean> {
        if (!this.isAvailable) return false;
        const credentialId = localStorage.getItem('biometric_credential_id');
        if (!credentialId) return false;
        try {
            const challenge = await this.getChallenge();
            const assertion = await navigator.credentials.get({
                publicKey: {
                    challenge: Uint8Array.from(challenge, (c) =>
                        c.charCodeAt(0),
                    ),
                    allowCredentials: [
                        {
                            id: Uint8Array.from(atob(credentialId), (c) =>
                                c.charCodeAt(0),
                            ),
                            type: 'public-key',
                        },
                    ],
                    userVerification: 'required',
                    timeout: 60000,
                },
            });
            return !!assertion;
        } catch (error) {
            console.error('Biometric authentication failed:', error);
            return false;
        }
    }

    private async getChallenge(): Promise<string> {
        // In production, fetch from server. For now, generate locally.
        return Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map((b) => String.fromCharCode(b))
            .join('');
    }

    isRegistered(): boolean {
        return localStorage.getItem('biometric_credential_id') !== null;
    }

    async remove(): Promise<void> {
        localStorage.removeItem('biometric_credential_id');
    }
}

export const biometricService = new BiometricService();
