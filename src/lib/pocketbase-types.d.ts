/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	GroupMembers = "group_members",
	GroupTodos = "group_todos",
	Groups = "groups",
	PrivateTodos = "private_todos",
	PublicTodos = "public_todos",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created?: IsoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated?: IsoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated?: IsoDateString
}

export type MfasRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	method: string
	recordRef: string
	updated?: IsoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated?: IsoDateString
}

export type SuperusersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export type GroupMembersRecord = {
	created?: IsoDateString
	group?: RecordIdString
	id: string
	updated?: IsoDateString
	user?: RecordIdString
}

export type GroupTodosRecord = {
	author?: RecordIdString
	completed?: boolean
	created?: IsoDateString
	description?: string
	group?: RecordIdString
	id: string
	title?: string
	updated?: IsoDateString
}

export type GroupsRecord = {
	admin?: RecordIdString
	created?: IsoDateString
	id: string
	name?: string
	updated?: IsoDateString
}

export type PrivateTodosRecord = {
	completed?: boolean
	created?: IsoDateString
	description?: string
	id: string
	title?: string
	updated?: IsoDateString
	user?: RecordIdString
}

export type PublicTodosRecord = {
	author?: RecordIdString
	completed?: boolean
	created?: IsoDateString
	description?: string
	id: string
	last_edited_at?: IsoDateString
	title?: string
	updated?: IsoDateString
}

export type UsersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type GroupMembersResponse<Texpand = unknown> = Required<GroupMembersRecord> & BaseSystemFields<Texpand>
export type GroupTodosResponse<Texpand = unknown> = Required<GroupTodosRecord> & BaseSystemFields<Texpand>
export type GroupsResponse<Texpand = unknown> = Required<GroupsRecord> & BaseSystemFields<Texpand>
export type PrivateTodosResponse<Texpand = unknown> = Required<PrivateTodosRecord> & BaseSystemFields<Texpand>
export type PublicTodosResponse<Texpand = unknown> = Required<PublicTodosRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	group_members: GroupMembersRecord
	group_todos: GroupTodosRecord
	groups: GroupsRecord
	private_todos: PrivateTodosRecord
	public_todos: PublicTodosRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	group_members: GroupMembersResponse
	group_todos: GroupTodosResponse
	groups: GroupsResponse
	private_todos: PrivateTodosResponse
	public_todos: PublicTodosResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>
	collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>
	collection(idOrName: '_mfas'): RecordService<MfasResponse>
	collection(idOrName: '_otps'): RecordService<OtpsResponse>
	collection(idOrName: '_superusers'): RecordService<SuperusersResponse>
	collection(idOrName: 'group_members'): RecordService<GroupMembersResponse>
	collection(idOrName: 'group_todos'): RecordService<GroupTodosResponse>
	collection(idOrName: 'groups'): RecordService<GroupsResponse>
	collection(idOrName: 'private_todos'): RecordService<PrivateTodosResponse>
	collection(idOrName: 'public_todos'): RecordService<PublicTodosResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
