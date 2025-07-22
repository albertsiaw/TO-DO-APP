import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '../lib/pocketbase';
import { toast } from 'sonner';
import type { GroupsRecord, UsersRecord, GroupMembersRecord } from '../lib/pocketbase-types';

interface GroupWithAdmin extends GroupsRecord {
  id: string;
  name: string;
  expand?: {
    admin: UsersRecord;
  };
}

interface GroupMemberWithUserAndGroup extends GroupMembersRecord {
  id: string;
  expand?: {
    user: UsersRecord;
    group: GroupsRecord;
  };
}

interface GroupFormInput {
  name: string;
}

export function useGroupManagement() {
  const queryClient = useQueryClient();
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupWithAdmin | null>(null);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState<string>('');
  const currentUserId = pb.authStore.model?.id;

  // Fetch Groups
  const groupsQuery = useQuery<GroupWithAdmin[]>({
    queryKey: ['groups', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      const memberships = await pb.collection('group_members').getFullList({
        filter: `user = "${currentUserId}"`,
        expand: 'group',
      });
      const memberGroupIds = memberships.map(m => m.group);

      const adminGroups = await pb.collection('groups').getFullList({
        sort: '-created',
        expand: 'admin',
        filter: `admin = "${currentUserId}"`,
      });

      let memberGroups: GroupWithAdmin[] = [];
      if (memberGroupIds.length > 0) {
        memberGroups = await pb.collection('groups').getFullList({
          sort: '-created',
          expand: 'admin',
          filter: memberGroupIds.map(id => `id = "${id}"`).join(' || '),
        });
      }

      const allGroups = [...adminGroups, ...memberGroups].filter(
        (group, i, arr) => arr.findIndex(g => g.id === group.id) === i
      );
      return allGroups as GroupWithAdmin[];
    },
    enabled: !!currentUserId,
  });

  // Fetch All Users
  const allUsersQuery = useQuery<UsersRecord[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const records = await pb.collection('users').getFullList({
        filter: `id != "${currentUserId}"`,
      });
      return records as UsersRecord[];
    },
    enabled: isManageMembersModalOpen,
  });

  // Fetch Group Members
  const groupMembersQuery = useQuery<GroupMemberWithUserAndGroup[]>({
    queryKey: ['groupMembers', selectedGroup?.id],
    queryFn: async () => {
      if (!selectedGroup?.id) return [];
      const records = await pb.collection('group_members').getFullList({
        filter: `group = "${selectedGroup.id}"`,
        expand: 'user',
      });
      return records as GroupMemberWithUserAndGroup[];
    },
    enabled: !!selectedGroup?.id && isManageMembersModalOpen,
  });

  // Create Group Mutation
  const createGroupMutation = useMutation({
    mutationFn: async (newGroup: GroupFormInput) => {
      if (!currentUserId) throw new Error("User not authenticated.");
      const record = await pb.collection('groups').create({
        ...newGroup,
        admin: currentUserId,
      });
      return record as GroupsRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast("Group Created", { description: "Your new group has been added." });
      setIsCreateGroupModalOpen(false);
    },
    onError: (error: any) => {
      toast("Error Creating Group", { description: error.message || "Failed to create group." });
    },
  });

  // Delete Group Mutation
  const deleteGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      await pb.collection('groups').delete(groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast("Group Deleted", { description: "The group has been removed." });
    },
    onError: (error: any) => {
      toast("Error Deleting Group", { description: error.message || "Failed to delete group." });
    },
  });

  // Add Member Mutation
  const addMemberMutation = useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      const existingMember = groupMembersQuery.data?.find(member => member.expand?.user?.id === userId);
      if (existingMember) throw new Error("User is already a member of this group.");
      await pb.collection('group_members').create({ group: groupId, user: userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', selectedGroup?.id] });
      toast("Member Added", { description: "User has been added to the group." });
      setSelectedUserToAdd('');
    },
    onError: (error: any) => {
      toast("Error Adding Member", { description: error.message || "Failed to add member." });
    },
  });

  // Remove Member Mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      await pb.collection('group_members').delete(memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMembers', selectedGroup?.id] });
      toast("Member Removed", { description: "User has been removed from the group." });
    },
    onError: (error: any) => {
      toast("Error Removing Member", { description: error.message || "Failed to remove member." });
    },
  });

  return {
    isCreateGroupModalOpen,
    setIsCreateGroupModalOpen,
    isManageMembersModalOpen,
    setIsManageMembersModalOpen,
    selectedGroup,
    setSelectedGroup,
    selectedUserToAdd,
    setSelectedUserToAdd,
    currentUserId,
    groupsQuery,
    allUsersQuery,
    groupMembersQuery,
    createGroupMutation,
    deleteGroupMutation,
    addMemberMutation,
    removeMemberMutation,
  };
}