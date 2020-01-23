export interface SetMembers {
  member: SetMember[],
  total_record_count: number
}

export interface SetMember {
  id: string,
  description: string,
  link: string
}

export interface Set {
  id: string,
  name: string,
  description?: string,
  link: string
}

export interface Sets {
  total_record_count: number,
  set: Set[]
}