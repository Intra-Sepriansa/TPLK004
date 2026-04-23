import axios from 'axios';

export type KasPaymentMethod = 'cash' | 'transfer' | 'qris';
export type KasActionStatus = 'paid' | 'unpaid';

export interface PendingKasAction {
    kind?: 'payment';
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

export interface PendingKasExpense {
    kind?: 'expense';
    id: string;
    amount: number;
    description: string;
    category: string;
    periodDate: string;
    createdAt: number;
}

export interface PendingKasPertemuan {
    kind?: 'pertemuan';
    id: string;
    periodDate: string;
    createdAt: number;
}

export interface PendingKasQueueStatus {
    payments: number;
    expenses: number;
    pertemuan: number;
    total: number;
}

const STORAGE_KEY = 'admin_kas_pending_actions_v1';
const EXPENSE_STORAGE_KEY = 'admin_kas_pending_expenses_v1';
const PERTEMUAN_STORAGE_KEY = 'admin_kas_pending_pertemuan_v1';

function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

function buildActionId(mahasiswaId: number, periodDate: string): string {
    return `${mahasiswaId}:${periodDate}`;
}

function buildExpenseId(): string {
    return `expense:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
}

function buildPertemuanId(periodDate: string): string {
    return `pertemuan:${periodDate}`;
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

function readStoredArray<T>(key: string): T[] {
    if (!isBrowser()) {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(key);
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

function saveStoredArray<T>(key: string, items: T[]): void {
    if (!isBrowser()) {
        return;
    }

    window.localStorage.setItem(key, JSON.stringify(items));
}

export function getPendingKasActions(): PendingKasAction[] {
    return readStoredArray<PendingKasAction>(STORAGE_KEY);
}

export function getPendingKasExpenses(): PendingKasExpense[] {
    return readStoredArray<PendingKasExpense>(EXPENSE_STORAGE_KEY);
}

export function getPendingKasPertemuan(): PendingKasPertemuan[] {
    return readStoredArray<PendingKasPertemuan>(PERTEMUAN_STORAGE_KEY);
}

export function getPendingKasQueueStatus(): PendingKasQueueStatus {
    const payments = getPendingKasActions().length;
    const expenses = getPendingKasExpenses().length;
    const pertemuan = getPendingKasPertemuan().length;

    return {
        payments,
        expenses,
        pertemuan,
        total: payments + expenses + pertemuan,
    };
}

function savePendingKasActions(actions: PendingKasAction[]): void {
    saveStoredArray(STORAGE_KEY, actions);
}

function savePendingKasExpenses(expenses: PendingKasExpense[]): void {
    saveStoredArray(EXPENSE_STORAGE_KEY, expenses);
}

function savePendingKasPertemuan(pertemuan: PendingKasPertemuan[]): void {
    saveStoredArray(PERTEMUAN_STORAGE_KEY, pertemuan);
}

export function upsertPendingKasAction(
    action: Omit<PendingKasAction, 'id' | 'createdAt' | 'kind'>,
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
        kind: 'payment',
        id: buildActionId(action.mahasiswaId, action.periodDate),
        createdAt: Date.now(),
    };

    current.push(next);
    savePendingKasActions(current);

    return current;
}

export function queuePendingKasExpense(
    expense: Omit<PendingKasExpense, 'id' | 'createdAt' | 'kind'>,
): PendingKasExpense[] {
    const current = getPendingKasExpenses();
    const next: PendingKasExpense = {
        ...expense,
        kind: 'expense',
        id: buildExpenseId(),
        createdAt: Date.now(),
    };

    current.push(next);
    savePendingKasExpenses(current);

    return current;
}

export function queuePendingKasPertemuan(
    periodDate: string,
): PendingKasPertemuan[] {
    const current = getPendingKasPertemuan().filter(
        (item) => item.periodDate !== periodDate,
    );

    const next: PendingKasPertemuan = {
        kind: 'pertemuan',
        id: buildPertemuanId(periodDate),
        periodDate,
        createdAt: Date.now(),
    };

    current.push(next);
    savePendingKasPertemuan(current);

    return current;
}

export function removePendingKasAction(actionId: string): PendingKasAction[] {
    const next = getPendingKasActions().filter((item) => item.id !== actionId);
    savePendingKasActions(next);

    return next;
}

export function removePendingKasExpense(
    expenseId: string,
): PendingKasExpense[] {
    const next = getPendingKasExpenses().filter(
        (item) => item.id !== expenseId,
    );
    savePendingKasExpenses(next);

    return next;
}

export function removePendingKasPertemuan(
    pertemuanId: string,
): PendingKasPertemuan[] {
    const next = getPendingKasPertemuan().filter(
        (item) => item.id !== pertemuanId,
    );
    savePendingKasPertemuan(next);

    return next;
}

export function removePendingKasActionsForDate(
    periodDate: string,
): PendingKasAction[] {
    const next = getPendingKasActions().filter(
        (item) => item.periodDate !== periodDate,
    );
    savePendingKasActions(next);
    savePendingKasPertemuan(
        getPendingKasPertemuan().filter(
            (item) => item.periodDate !== periodDate,
        ),
    );

    return next;
}

export async function syncPendingKasActions(): Promise<{
    successCount: number;
    failedCount: number;
    remaining: PendingKasAction[];
    errorMessages: string[];
}> {
    if (!isBrowser() || !navigator.onLine) {
        const status = getPendingKasQueueStatus();

        return {
            successCount: 0,
            failedCount: status.total,
            remaining: getPendingKasActions(),
            errorMessages: ['Perangkat sedang offline.'],
        };
    }

    const pertemuanQueue = [...getPendingKasPertemuan()].sort(
        (a, b) => a.createdAt - b.createdAt,
    );
    const expenseQueue = [...getPendingKasExpenses()].sort(
        (a, b) => a.createdAt - b.createdAt,
    );
    const paymentQueue = [...getPendingKasActions()].sort(
        (a, b) => a.createdAt - b.createdAt,
    );

    let successCount = 0;
    let failedCount = 0;
    const errorMessages: string[] = [];
    const csrfToken = getCsrfToken();
    const requestConfig = {
        timeout: 5000,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Accept: 'application/json',
            ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
        },
    };

    for (const item of pertemuanQueue) {
        try {
            await axios.post(
                '/admin/kas/create-pertemuan',
                {
                    period_date: item.periodDate,
                },
                requestConfig,
            );

            removePendingKasPertemuan(item.id);
            successCount++;
        } catch (error: unknown) {
            const { shouldDrop, message } = normalizeSyncError(
                error,
                `Gagal sinkron pertemuan ${item.periodDate}`,
            );

            if (shouldDrop) {
                removePendingKasPertemuan(item.id);
            } else {
                failedCount++;
            }

            errorMessages.push(message);
        }
    }

    for (const item of expenseQueue) {
        try {
            await axios.post(
                '/admin/kas/expense',
                {
                    amount: item.amount,
                    description: item.description,
                    category: item.category,
                    period_date: item.periodDate,
                },
                requestConfig,
            );

            removePendingKasExpense(item.id);
            successCount++;
        } catch (error: unknown) {
            const { shouldDrop, message } = normalizeSyncError(
                error,
                `Gagal sinkron pengeluaran ${item.description}`,
            );

            if (shouldDrop) {
                removePendingKasExpense(item.id);
            } else {
                failedCount++;
            }

            errorMessages.push(message);
        }
    }

    for (const item of paymentQueue) {
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
                requestConfig,
            );

            removePendingKasAction(item.id);
            successCount++;
        } catch (error: unknown) {
            const { shouldDrop, message } = normalizeSyncError(
                error,
                `Gagal sinkron ${item.studentName}`,
            );

            if (shouldDrop) {
                removePendingKasAction(item.id);
            } else {
                failedCount++;
            }

            errorMessages.push(message);
        }
    }

    return {
        successCount,
        failedCount,
        remaining: getPendingKasActions(),
        errorMessages,
    };
}

function normalizeSyncError(
    error: unknown,
    fallbackMessage: string,
): { shouldDrop: boolean; message: string } {
    const axiosError = error as AxiosLikeError;
    const status = axiosError?.response?.status;
    const message =
        axiosError?.response?.data?.message ??
        axiosError?.message ??
        fallbackMessage;

    return {
        shouldDrop:
            typeof status === 'number' &&
            status >= 400 &&
            status < 500 &&
            status !== 429,
        message,
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
