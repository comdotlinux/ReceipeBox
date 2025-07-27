export interface User {
	id: string;
	email: string;
	username?: string;
	name: string;
	avatar?: string;
	role: 'admin' | 'reader';
	emailVisibility: boolean;
	verified: boolean;
	created: string;
	updated: string;
}

export interface UserCreateData {
	email: string;
	password: string;
	passwordConfirm: string;
	name: string;
	username?: string;
	avatar?: File;
	role?: 'admin' | 'reader';
}

export interface UserUpdateData extends Partial<UserCreateData> {
	id: string;
}

export interface UserLoginData {
	email: string;
	password: string;
}

export interface UserAuthResponse {
	record: User;
	token: string;
}

export interface UserProfile {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	role: 'admin' | 'reader';
	created: string;
}
