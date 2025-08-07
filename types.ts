export const THEME_PARTS = [ 'fonts', 'theme', 'variables', 'typography', 'layout', 'form' ];

export type ThemePartsType = typeof THEME_PARTS[ number ];
export type ThemeModeType = 'light' | 'dark';
export type ThemeDataType = {
	light: Record<string, string>;
	dark: Record<string, string>;
	parts?: ThemePartsType[];
};
export type ThemeDataArg = ThemeDataType & { mode?: ThemeModeType; };

export type ColorModeType = 'mode1' | 'mode2' | 'mode3' | 'mode4';
export type ColorsType = Record<ColorModeType, string>;
export type DefaultColorsType = Record<ThemeModeType, ColorsType>;