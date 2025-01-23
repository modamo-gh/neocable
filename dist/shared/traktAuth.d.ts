export declare const exchangeToken: (authCode: string) => Promise<any>;
export declare const fetchMovieRecommendations: () => Promise<any>;
export declare const fetchUserProfile: () => Promise<any>;
export declare const generateTraktAuthURL: () => string;
export declare const getValidToken: () => Promise<string>;
export declare const loadToken: () => any;
export declare const refreshAccessToken: (refreshToken: string) => Promise<any>;
export declare const saveToken: (tokenData: any) => void;
