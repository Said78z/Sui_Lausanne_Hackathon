import { Button } from '@/components';
import { BadgeService } from '@/services/badgeService';
import { formatRole } from '@/services/formatRoleService';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { User, UserRole } from '@shared/dto/userDto';
import { Eye, Pencil, Plus, Trash } from 'lucide-react';

import { FilterButton } from '@/components/ui/FilterButton/FilterButton';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import { SearchBar } from '@/components/ui/SearchBar/SearchBar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table/Table';

import usersData from '@/mocks/usersMock.json';

import AddUser from './components/AddUser';
import EditUser from './components/EditUser';

interface FilterOption {
    label: string;
    value: string;
    type: string;
}

// Conversion des données mockées vers le type User
const convertMockUsersToUserType = (mockUsers: any[]): User[] => {
    return mockUsers.map((user) => ({
        ...user,
        roles: user.roles as UserRole,
        isVerified: user.isVerified ?? false,
    }));
};

export default function Users() {
    const { t } = useTranslation();
    const [users, setUsers] = useState<User[]>(convertMockUsersToUserType(usersData.users));
    const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
    const [filters, setFilters] = useState({
        role: 'Tous',
        status: 'Tous',
    });
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isEditUserOpen, setIsEditUserOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const handleFilterChange = useCallback(
        (type: string, value: string) => {
            setFilters({
                ...filters,
                [type]: value,
            });
        },
        [filters]
    );

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const handleAddUser = (data: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        civility: string;
        roles: UserRole;
        birthDate: string;
        isVerified: boolean;
    }) => {
        const newUser: User = {
            id: (users.length + 1).toString(),
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            civility: data.civility,
            roles: data.roles,
            birthDate: data.birthDate,
            isVerified: data.isVerified,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setUsers((prevUsers) => [...prevUsers, newUser]);
    };

    const handleEditUser = (data: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        civility: string;
        roles: UserRole;
        birthDate: string;
        isVerified: boolean;
    }) => {
        if (!selectedUser) return;

        const updatedUser: User = {
            ...selectedUser,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            civility: data.civility,
            roles: data.roles,
            birthDate: data.birthDate,
            isVerified: data.isVerified,
            updatedAt: new Date().toISOString(),
        };

        setUsers((prevUsers) =>
            prevUsers.map((user) => (user.id === selectedUser.id ? updatedUser : user))
        );
    };

    useEffect(() => {
        let result = [...users];

        if (searchQuery) {
            result = result.filter(
                (user) =>
                    user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filters.role !== 'Tous') {
            result = result.filter((user) => user.roles === filters.role);
        }

        if (filters.status !== 'Tous') {
            result = result.filter((user) =>
                filters.status === 'Vérifié' ? user.isVerified : !user.isVerified
            );
        }

        if (sortColumn && sortDirection) {
            result = [...result].sort((a, b) => {
                const aValue = a[sortColumn as keyof User];
                const bValue = b[sortColumn as keyof User];

                return sortDirection === 'asc'
                    ? String(aValue).localeCompare(String(bValue))
                    : String(bValue).localeCompare(String(aValue));
            });
        }

        setFilteredUsers(result);
    }, [searchQuery, filters, sortColumn, sortDirection, users]);

    const roleOptions: FilterOption[] = [
        { label: t('users.filters.all'), value: 'Tous', type: 'role' },
        { label: formatRole(UserRole.Client), value: UserRole.Client, type: 'role' },
        { label: formatRole(UserRole.Consultant), value: UserRole.Consultant, type: 'role' },
        { label: formatRole(UserRole.Agent), value: UserRole.Agent, type: 'role' },
        { label: formatRole(UserRole.Lead), value: UserRole.Lead, type: 'role' },
        { label: formatRole(UserRole.CGP), value: UserRole.CGP, type: 'role' },
        { label: formatRole(UserRole.SDR), value: UserRole.SDR, type: 'role' },
    ];

    const statusOptions: FilterOption[] = [
        { label: t('users.filters.all'), value: 'Tous', type: 'status' },
        { label: t('users.filters.verified'), value: 'Vérifié', type: 'status' },
        { label: t('users.filters.notVerified'), value: 'Non vérifié', type: 'status' },
    ];

    const filterOptions = [...roleOptions, ...statusOptions];

    const onDelete = (id: string) => {
        setUsers(users.filter((user) => user.id !== id));
    };

    return (
        <div className="p-6">
            <h1 className="mb-6 text-2xl font-bold">{t('users.title')}</h1>
            <div className="mb-6 flex w-full gap-4">
                <SearchBar onSearch={handleSearch} className="flex-1" />
                <FilterButton
                    filters={{
                        role: filters.role,
                        status: filters.status,
                    }}
                    filterOptions={filterOptions}
                    onFilterChange={handleFilterChange}
                />
                <Button variant="primary" className="w-auto" onClick={() => setIsAddUserOpen(true)}>
                    <div className="flex items-center gap-2">
                        <Plus size={16} />
                        <span>{t('users.add')}</span>
                    </div>
                </Button>
            </div>

            <Table variant="striped">
                <TableHeader>
                    <TableRow>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'firstName' ? sortDirection : null}
                            onClick={() => handleSort('firstName')}
                        >
                            {t('users.table.name')}
                        </TableHead>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'email' ? sortDirection : null}
                            onClick={() => handleSort('email')}
                        >
                            {t('users.table.email')}
                        </TableHead>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'phone' ? sortDirection : null}
                            onClick={() => handleSort('phone')}
                        >
                            {t('users.table.phone')}
                        </TableHead>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'roles' ? sortDirection : null}
                            onClick={() => handleSort('roles')}
                        >
                            {t('users.table.role')}
                        </TableHead>
                        <TableHead
                            sortable
                            sortDirection={sortColumn === 'isVerified' ? sortDirection : null}
                            onClick={() => handleSort('isVerified')}
                        >
                            {t('users.table.status')}
                        </TableHead>
                        <TableHead>{t('users.table.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredUsers.map((user) => {
                        const roleBadge = BadgeService.getRoleBadge(user.roles);
                        const verificationBadge = BadgeService.getVerificationBadge(
                            user.isVerified ?? false
                        );

                        return (
                            <TableRow key={user.id}>
                                <TableCell>
                                    {user.civility} {user.firstName} {user.lastName}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.phone}</TableCell>
                                <TableCell>
                                    <span className={`rounded-full ${roleBadge.className}`}>
                                        {roleBadge.label}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className={`rounded-full ${verificationBadge.className}`}>
                                        {verificationBadge.label}
                                    </span>
                                </TableCell>
                                <TableCell className="flex items-center gap-2">
                                    <Button variant="primary">
                                        <Eye size={16} />
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedUser(user);
                                            setIsEditUserOpen(true);
                                        }}
                                    >
                                        <Pencil size={16} />
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(user.id.toString());
                                        }}
                                    >
                                        <Trash size={16} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            <div className="mt-auto flex justify-center pt-4">
                {filteredUsers.length > 0 && (
                    <Pagination
                        currentPage={1}
                        totalPages={Math.ceil(filteredUsers.length / 10)}
                        onPageChange={() => {}}
                    />
                )}
            </div>
            <AddUser
                isOpen={isAddUserOpen}
                onClose={() => setIsAddUserOpen(false)}
                onSubmit={handleAddUser}
            />
            {selectedUser && (
                <EditUser
                    isOpen={isEditUserOpen}
                    onClose={() => {
                        setIsEditUserOpen(false);
                        setSelectedUser(null);
                    }}
                    onSubmit={handleEditUser}
                    user={selectedUser}
                />
            )}
        </div>
    );
}
