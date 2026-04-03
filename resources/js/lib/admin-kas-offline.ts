import axios from 'axios';

export type KasPaymentMethod = 'cash' | 'transfer' | 'qris';
export type KasActionStatus = 'paid' | 'unpaid';

export interface PendingKasAction {
    id: string;
    mahasiswaId: number;
    periodDate: string;
    status: KasActionStatus;
    paymentMethod: KasPaymentMethod;
    paymentReference?: string;
    paymentNote?: string;
    studentName: string;
    createdAt: number;
}

const STORAGE_KEY = 'admin_kas_pending_actions_v1';

function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

function buildActionId(mahasiswaId: number, periodDate: string): string {
    return `${mahasiswaId}:${periodDate}`;
}

function getCsrfToken(): string | null {
    if (!isBrowser()) {
        return null;
    }

    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? null
    );
}

export function getPendingKasActions(): PendingKasAction[] {
    if (!isBrowser()) {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn('Failed to read kas offline queue', error);
        return [];
    }
}

function savePendingKasActions(actions: PendingKasAction[]): void {
    if (!isBrowser()) {
        return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
}

export function upsertPendingKasAction(
    action: Omit<PendingKasAction, 'id' | 'createdAt'>,
): PendingKasAction[] {
    const current = getPendingKasActions().filter(
        (item) =>
            !(
                item.mahasiswaId === action.mahasiswaId &&
                item.periodDate === action.periodDate
            ),
    );

    const next: PendingKasAction = {
        ...action,
        id: buildActionId(action.mahasiswaId, action.periodDate),
        createdAt: Date.now(),
    };

    current.push(next);
    savePendingKasActions(current);

    return current;
}

export function removePendingKasAction(actionId: string): PendingKasAction[] {
    const next = getPendingKasActions().filter((item) => item.id !== actionId);
    savePendingKasActions(next);

    return next;
}

export function removePendingKasActionsForDate(
    periodDate: string,
): PendingKasAction[] {
    const next = getPendingKasActions().filter(
        (item) => item.periodDate !== periodDate,
    );
    savePendingKasActions(next);

    return next;
}

export async function syncPendingKasActions(): Promise<{
    successCount: number;
    failedCount: number;
    remaining: PendingKasAction[];
    errorMessages: string[];
}> {
    if (!isBrowser() || !navigator.onLine) {
        return {
            successCount: 0,
            failedCount: getPendingKasActions().length,
            remaining: getPendingKasActions(),
            errorMessages: ['Perangkat sedang offline.'],
        };
    }

    const queue = [...getPendingKasActions()].sort(
        (a, b) => a.createdAt - b.createdAt,
    );

    let successCount = 0;
    let failedCount = 0;
    const errorMessages: string[] = [];
    const csrfToken = getCsrfToken();

    for (const item of queue) {
        try {
            const endpoint =
                item.status === 'paid'
                    ? '/admin/kas/mark-paid'
                    : '/admin/kas/mark-unpaid';

            await axios.post(
                endpoint,
                {
                    mahasiswa_id: item.mahasiswaId,
                    period_date: item.periodDate,
                    payment_method:
                        item.status === 'paid' ? item.paymentMethod : undefined,
                    payment_reference:
                        item.status === 'paid'
                            ? item.paymentReference
                            : undefined,
                    payment_note:
                        item.status === 'paid' ? item.paymentNote : undefined,
                },
                {
                    timeout: 5000,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        Accept: 'application/json',
                        ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                    },
                },
            );

            removePendingKasAction(item.id);
            successCount++;
        } catch (error: unknown) {
            const axiosError = error as AxiosLikeError;
            const status = axiosError?.response?.status;
            const message =
                axiosError?.response?.data?.message ??
                axiosError?.message ??
                `Gagal sinkron ${item.studentName}`;

            if (
                typeof status === 'number' &&
                status >= 400 &&
                status < 500 &&
                status !== 429
            ) {
                removePendingKasAction(item.id);
                errorMessages.push(message);
            } else {
                failedCount++;
                errorMessages.push(message);
            }
        }
    }

    return {
        successCount,
        failedCount,
        remaining: getPendingKasActions(),
        errorMessages,
    };
}

interface AxiosLikeError {
    message?: string;
    response?: {
        status?: number;
        data?: {
            message?: string;
        };
    };
}
