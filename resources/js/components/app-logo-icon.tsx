import { type ComponentPropsWithoutRef } from 'react';

type AppLogoIconProps = Omit<ComponentPropsWithoutRef<'img'>, 'src'>;

export default function AppLogoIcon({
    alt = 'Logo UNPAM',
    className,
    ...props
}: AppLogoIconProps) {
    const resolvedClassName = ['object-contain', className]
        .filter(Boolean)
        .join(' ');

    return (
        <img
            src="/logo-unpam.png"
            alt={alt}
            className={resolvedClassName}
            {...props}
        />
    );
}
