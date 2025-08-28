export const THEME_PARTS = [ 'fonts', 'variables', 'theme', 'typography', 'layout', 'form' ];
export const THEME_MODES = [ 'light', 'dark' ];
export const COLOR_MODES = [ 'mode1', 'mode2', 'mode3', 'mode4', 'background', 'color', 'success', 'warning', 'error' ];

export type ThemePartsType = typeof THEME_PARTS[ number ];
export type ThemeModeType = typeof THEME_MODES[ number ];
export type ColorModeType = typeof COLOR_MODES[ number ];

export type ThemeDataType = {
	light?: ColorsType;
	dark?: ColorsType;
	parts?: ThemePartsType[];
};
export type ThemeDataArg = ThemeDataType & { mode?: ThemeModeType; };

export type ColorsType = Record<ColorModeType, string>;
export type DefaultColorsType = Record<ThemeModeType, ColorsType>;