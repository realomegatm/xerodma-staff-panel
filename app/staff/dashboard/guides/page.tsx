'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    BookOpen,
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Lock,
    Unlock,
    Eye,
    Calendar,
    User,
    Shield,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Guide {
    id: string;
    title: string;
    description: string;
    category: string;
    is_password_protected: boolean;
    created_date: string;
    last_modified: string;
    author_name: string | null;
    views: number;
    status: string;
}

export default function GuidesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
    const [newGuide, setNewGuide] = useState({
        title: '',
        description: '',
        category: '',
        content: '',
        isPasswordProtected: false,
        password: '',
    });
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/staff');
        } else if (status === 'authenticated') {
            async function fetchGuides() {
                try {
                    const res = await fetch('/api/guides');
                    if (res.ok) {
                        const data = await res.json();
                        setGuides(data);
                    }
                } catch (err) {
                    console.error('Failed to fetch guides');
                } finally {
                    setLoading(false);
                }
            }
            fetchGuides();
        }
    }, [status, router]);

    const filteredGuides = guides.filter(
        (guide) =>
            guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guide.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateGuide = async () => {
        console.log('Creating guide:', newGuide);
        // TODO: Implement create API
        setIsCreateDialogOpen(false);
        setNewGuide({
            title: '',
            description: '',
            category: '',
            content: '',
            isPasswordProtected: false,
            password: '',
        });
    };

    const handlePasswordUpdate = async () => {
        if (!selectedGuide) return;

        try {
            const res = await fetch('/api/guides/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guideId: selectedGuide.id, newPassword }),
            });

            if (res.ok) {
                const updatedRes = await fetch('/api/guides');
                if (updatedRes.ok) {
                    setGuides(await updatedRes.json());
                }
                setIsPasswordDialogOpen(false);
                setNewPassword('');
                setSelectedGuide(null);
            } else {
                alert('Failed to update password');
            }
        } catch (err) {
            alert('Error updating password');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge className='bg-primary text-primary-foreground'>Published</Badge>;
            case 'draft':
                return <Badge variant='secondary'>Draft</Badge>;
            case 'archived':
                return <Badge variant='outline'>Archived</Badge>;
            default:
                return <Badge variant='outline'>Unknown</Badge>;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category.toLowerCase()) {
            case 'installation':
                return 'bg-primary/10 text-primary border-primary/20';
            case 'hardware':
                return 'bg-accent/10 text-accent border-accent/20';
            case 'gaming':
                return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'support':
                return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    if (loading || status === 'loading') return <div>Loading...</div>;
    if (!session) return null;

    return (
        <DashboardLayout>
            <div className='space-y-6'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h1 className='text-3xl font-bold text-foreground'>Guide Management</h1>
                        <p className='text-muted-foreground'>Create, edit, and manage product guides</p>
                    </div>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className='bg-primary hover:bg-primary/90 text-primary-foreground'>
                                <Plus className='w-4 h-4 mr-2' />
                                Create Guide
                            </Button>
                        </DialogTrigger>
                        <DialogContent className='bg-card border-border max-w-2xl'>
                            <DialogHeader>
                                <DialogTitle className='text-card-foreground'>Create New Guide</DialogTitle>
                                <DialogDescription className='text-muted-foreground'>
                                    Add a new product guide to the system
                                </DialogDescription>
                            </DialogHeader>
                            <div className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='title' className='text-card-foreground'>
                                        Title
                                    </Label>
                                    <Input
                                        id='title'
                                        placeholder='Enter guide title'
                                        value={newGuide.title}
                                        onChange={(e) => setNewGuide({ ...newGuide, title: e.target.value })}
                                        className='bg-input border-border text-foreground'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='description' className='text-card-foreground'>
                                        Description
                                    </Label>
                                    <Textarea
                                        id='description'
                                        placeholder='Enter guide description'
                                        value={newGuide.description}
                                        onChange={(e) => setNewGuide({ ...newGuide, description: e.target.value })}
                                        className='bg-input border-border text-foreground'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='category' className='text-card-foreground'>
                                        Category
                                    </Label>
                                    <Input
                                        id='category'
                                        placeholder='Enter category (e.g., Installation, Hardware)'
                                        value={newGuide.category}
                                        onChange={(e) => setNewGuide({ ...newGuide, category: e.target.value })}
                                        className='bg-input border-border text-foreground'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='password' className='text-card-foreground'>
                                        Password (optional)
                                    </Label>
                                    <Input
                                        id='password'
                                        type='password'
                                        placeholder='Enter guide password'
                                        value={newGuide.password}
                                        onChange={(e) => setNewGuide({ ...newGuide, password: e.target.value, isPasswordProtected: !!e.target.value })}
                                        className='bg-input border-border text-foreground'
                                    />
                                </div>
                                <div className='flex justify-end space-x-2'>
                                    <Button
                                        variant='outline'
                                        onClick={() => setIsCreateDialogOpen(false)}
                                        className='border-border text-card-foreground'
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCreateGuide}
                                        className='bg-primary hover:bg-primary/90 text-primary-foreground'
                                    >
                                        Create Guide
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className='relative max-w-xl'>
                    <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='Search guides...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='pl-10 bg-input border-border text-foreground'
                    />
                </div>

                <Card className='bg-card border-border'>
                    <CardContent className='p-6'>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {filteredGuides.map((guide) => (
                                <Card key={guide.id} className='bg-card border-border'>
                                    <CardHeader className='flex flex-row items-start justify-between pb-3'>
                                        <div>
                                            <CardTitle className='text-xl text-card-foreground mb-2'>{guide.title}</CardTitle>
                                            <div className='flex items-center space-x-2 mb-2'>
                                                <Badge className={getCategoryColor(guide.category)}>{guide.category}</Badge>
                                                {getStatusBadge(guide.status)}
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant='ghost' className='h-8 w-8 p-0'>
                                                    <MoreHorizontal className='h-4 w-4' />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align='end' className='bg-popover border-border'>
                                                <DropdownMenuItem className='text-popover-foreground hover:bg-accent'>
                                                    <Edit className='mr-2 h-4 w-4' />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedGuide(guide);
                                                        setIsPasswordDialogOpen(true);
                                                    }}
                                                    className='text-popover-foreground hover:bg-accent'
                                                >
                                                    <Shield className='mr-2 h-4 w-4' />
                                                    Set Password
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className='text-destructive hover:bg-destructive/10'>
                                                    <Trash2 className='mr-2 h-4 w-4' />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardHeader>
                                    <CardContent className='pt-0'>
                                        <p className='text-sm text-muted-foreground mb-4'>{guide.description}</p>
                                        <div className='space-y-2 text-xs text-muted-foreground'>
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center space-x-1'>
                                                    <User className='w-3 h-3' />
                                                    <span>{guide.author_name || 'Unknown'}</span>
                                                </div>
                                                <div className='flex items-center space-x-1'>
                                                    {guide.is_password_protected ? (
                                                        <Lock className='w-3 h-3 text-primary' />
                                                    ) : (
                                                        <Unlock className='w-3 h-3 text-muted-foreground' />
                                                    )}
                                                    <span>{guide.is_password_protected ? 'Protected' : 'Public'}</span>
                                                </div>
                                            </div>
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center space-x-1'>
                                                    <Calendar className='w-3 h-3' />
                                                    <span>{new Date(guide.created_date).toLocaleDateString()}</span>
                                                </div>
                                                <div className='flex items-center space-x-1'>
                                                    <Eye className='w-3 h-3' />
                                                    <span>{guide.views} views</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                    <DialogContent className='bg-card border-border'>
                        <DialogHeader>
                            <DialogTitle className='text-card-foreground'>Set Guide Password</DialogTitle>
                            <DialogDescription className='text-muted-foreground'>
                                {selectedGuide && `Update password for "${selectedGuide.title}" (leave blank to remove protection)`}
                            </DialogDescription>
                        </DialogHeader>
                        <div className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='new-password' className='text-card-foreground'>
                                    New Password
                                </Label>
                                <Input
                                    id='new-password'
                                    type='password'
                                    placeholder='Enter new password or leave blank'
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className='bg-input border-border text-foreground'
                                />
                            </div>
                            <div className='flex justify-end space-x-2'>
                                <Button
                                    variant='outline'
                                    onClick={() => setIsPasswordDialogOpen(false)}
                                    className='border-border text-card-foreground'
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handlePasswordUpdate}
                                    className='bg-primary hover:bg-primary/90 text-primary-foreground'
                                >
                                    Update Password
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
}