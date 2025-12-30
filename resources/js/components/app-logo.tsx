import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md">
                <AppLogoIcon className="size-8" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/60">
                    Absensi
                </span>
                <span className="truncate leading-tight font-semibold">
                    TPLK004
                </span>
            </div>
        </>
    );
}
