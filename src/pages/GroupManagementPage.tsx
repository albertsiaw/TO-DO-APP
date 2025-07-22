import { useForm } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardDescription,
  CardTitle,
} from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { PlusCircle, Users, Trash2, Loader2, UserPlus, UserMinus, Eye } from 'lucide-react';
import { useGroupManagement } from '../hooks/useGroupManagement';

function GroupManagementPage() {
  const {
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
  } = useGroupManagement();

  const createGroupForm = useForm({
    defaultValues: { name: '' },
    onSubmit: async ({ value }) => {
      createGroupMutation.mutate(value);
    },
  });

  const handleManageMembersClick = (group: any) => {
    setSelectedGroup(group);
    setIsManageMembersModalOpen(true);
  };

  const availableUsers = allUsersQuery.data?.filter(
    (user) => !groupMembersQuery.data?.some((member) => member.expand?.user?.email === user.email)
  );

  if (groupsQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-lg text-gray-700">Loading groups...</p>
      </div>
    );
  }

  if (groupsQuery.isError) {
    return (
      <div className="text-center text-red-500 text-lg">
        Failed to load groups. Please try again.
      </div>
    );
  }

  const groups = groupsQuery.data;
  const allUsers = allUsersQuery.data;
  const groupMembers = groupMembersQuery.data;

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Group Management</h1>

      {/* Create New Group Button and Dialog */}
      <Dialog open={isCreateGroupModalOpen} onOpenChange={setIsCreateGroupModalOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => createGroupForm.reset()} className="mb-6 flex items-center gap-2">
            <PlusCircle className="h-5 w-5" /> Create New Group
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Give your new collaborative group a name.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              createGroupForm.handleSubmit();
            }}
            className="grid gap-4 py-4"
          >
            <createGroupForm.Field name="name">
              {({ state, handleChange, handleBlur }) => (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="groupName" className="text-right">
                    Group Name
                  </Label>
                  <Input
                    id="groupName"
                    value={state.value}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    className="col-span-3"
                    required
                  />
                  {state.meta.errors && <p className="col-span-4 text-sm text-red-500">{state.meta.errors.join(', ')}</p>}
                </div>
              )}
            </createGroupForm.Field>
            <DialogFooter>
              <Button type="submit" disabled={createGroupMutation.isPending}>
                {createGroupMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create Group
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* List of Groups */}
      {groups && groups.length > 0 ? (
        <div className="grid gap-4">
          {groups.map((group) => (
            <Card key={group.id} className="p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-purple-600" />
                  <div>
                    <CardTitle className="text-xl">{group.name}</CardTitle>
                    <CardDescription className="text-sm">
                      Admin: {group.expand?.admin?.email || 'Unknown'}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* View Group Todos Button */}
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/groups/$groupId" params={{ groupId: group.id }}>
                      <Eye className="h-4 w-4 mr-2" /> View Todos
                    </Link>
                  </Button>
                  {group.expand?.admin?.id === currentUserId && (
                    <>
                      <Button variant="secondary" size="sm" onClick={() => handleManageMembersClick(group)}>
                        <UserPlus className="h-4 w-4 mr-2" /> Manage Members
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteGroupMutation.mutate(group.id)}
                        disabled={deleteGroupMutation.isPending}
                      >
                        {deleteGroupMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 text-lg mt-10">
          You are not part of any groups yet. Create one or ask an admin to add you!
        </p>
      )}

      {/* Manage Members Dialog */}
      <Dialog open={isManageMembersModalOpen} onOpenChange={setIsManageMembersModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Members for "{selectedGroup?.name}"</DialogTitle>
            <DialogDescription>
              Add or remove users from this group.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Add Member Section */}
            <h3 className="text-lg font-semibold">Add Member</h3>
            <div className="flex gap-2">
              <Select onValueChange={setSelectedUserToAdd} value={selectedUserToAdd}>
                <SelectTrigger className="flex-grow">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {allUsersQuery.isLoading ? (
                    <SelectItem value="loading" disabled>Loading users...</SelectItem>
                  ) : availableUsers && availableUsers.length > 0 ? (
                    availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-users" disabled>No other users available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={() => addMemberMutation.mutate({ groupId: selectedGroup!.id, userId: selectedUserToAdd })}
                disabled={!selectedUserToAdd || addMemberMutation.isPending}
              >
                {addMemberMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                Add
              </Button>
            </div>

            {/* Current Members List */}
            <h3 className="text-lg font-semibold mt-4">Current Members</h3>
            {groupMembersQuery.isLoading ? (
              <div className="flex justify-center items-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <p className="ml-2 text-gray-600">Loading members...</p>
              </div>
            ) : groupMembers && groupMembers.length > 0 ? (
              <ul className="space-y-2">
                {groupMembers.map((member) => (
                  <li key={member.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                    <span>{member.expand?.user?.email || 'Unknown User'}</span>
                    {member.expand?.user?.email !== selectedGroup?.expand?.admin?.email && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMemberMutation.mutate(member.id)}
                        disabled={removeMemberMutation.isPending}
                      >
                        {removeMemberMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserMinus className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No members in this group yet.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManageMembersModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GroupManagementPage;