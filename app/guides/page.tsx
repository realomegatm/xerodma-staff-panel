'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookOpen, Lock, Search, Shield, Eye, Calendar, User } from 'lucide-react';

interface Guide {
    id: string;
    title: string;
    description: string;
    category: string;
    is_password_protected: boolean;
    created_date: string;
    author_name: string | null;
    views: number;
    status: string;
}

export default function PublicGuidesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
    const [password, setPassword] = useState('');
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [accessGranted, setAccessGranted] = useState<string[]>([]);
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, []);

    const filteredGuides = guides.filter(
        (guide) =>
            guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guide.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePasswordSubmit = async () => {
        if (!selectedGuide || !password) return;

        try {
            const res = await fetch('/api/guides/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ guideId: selectedGuide.id, password }),
            });

            const data = await res.json();

            if (data.success) {
                setAccessGranted([...accessGranted, selectedGuide.id]);
                setIsPasswordDialogOpen(false);
                setPassword('');
                setSelectedGuide(null);
            } else {
                alert(data.error || 'Invalid password');
            }
        } catch (err) {
            alert('Error verifying password');
        }
    };

    const requestAccess = (guide: Guide) => {
        setSelectedGuide(guide);
        setIsPasswordDialogOpen(true);
    };

    const getCategoryColor = (category: string) => {
        switch (category.toLowerCase()) {
            case 'installation':
                return 'bg-primary/10 text-primary border-primary/20';
            case 'hardware':
                return 'bg-accent/10 text-accent border-accent/20';
            case 'gaming':
                return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    if (loading) return <div>Loading guides...</div>;

    return (
        <div className='min-h-screen bg-background'>
            <div className='border-b border-border bg-card/50 backdrop-blur-sm'>
                <div className='container mx-auto px-6 py-8'>
                    <div className='text-center'>
                        <div className='inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4'>
                            <Shield className='w-8 h-8 text-primary-foreground' />
                        </div>
                        <h1 className='text-4xl font-bold text-foreground mb-2'>XERODMA Guides</h1>
                        <p className='text-xl text-muted-foreground'>Product documentation and setup guides</p>
                    </div>
                </div>
            </div>

            <div className='container mx-auto px-6 py-8'>
                <div className='space-y-8'>
                    <Card className='bg-card border-border'>
                        <CardHeader>
                            <CardTitle className='text-card-foreground'>Browse Guides</CardTitle>
                            <CardDescription className='text-muted-foreground'>
                                Find setup instructions and documentation for XERODMA products
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='relative'>
                                <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                                <Input
                                    placeholder='Search guides...'
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className='pl-10 bg-input border-border text-foreground'
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {filteredGuides.map((guide) => (
                            <Card key={guide.id} className='bg-card border-border hover:bg-card/80 transition-colors'>
                                <CardHeader className='pb-3'>
                                    <div className='flex items-start justify-between mb-2'>
                                        <Badge className={getCategoryColor(guide.category)}>{guide.category}</Badge>
                                        {guide.is_password_protected && <Lock className='w-4 h-4 text-primary' />}
                                    </div>
                                    <CardTitle className='text-lg text-card-foreground'>{guide.title}</CardTitle>
                                </CardHeader>
                                <CardContent className='pt-0'>
                                    <p className='text-sm text-muted-foreground mb-4'>{guide.description}</p>
                                    <div className='space-y-2 text-xs text-muted-foreground mb-4'>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center space-x-1'>
                                                <User className='w-3 h-3' />
                                                <span>{guide.author_name || 'Unknown'}</span>
                                            </div>
                                            <div className='flex items-center space-x-1'>
                                                <Eye className='w-3 h-3' />
                                                <span>{guide.views} views</span>
                                            </div>
                                        </div>
                                        <div className='flex items-center space-x-1'>
                                            <Calendar className='w-3 h-3' />
                                            <span>{new Date(guide.created_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    {accessGranted.includes(guide.id) ? (
                                        <Button className='w-full bg-primary hover:bg-primary/90 text-primary-foreground'>
                                            <BookOpen className='w-4 h-4 mr-2' />
                                            View Guide
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => requestAccess(guide)}
                                            variant='outline'
                                            className='w-full border-border text-card-foreground hover:bg-accent'
                                        >
                                            <Lock className='w-4 h-4 mr-2' />
                                            Request Access
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                        <DialogContent className='bg-card border-border'>
                            <DialogHeader>
                                <DialogTitle className='text-card-foreground'>Access Protected Guide</DialogTitle>
                                <DialogDescription className='text-muted-foreground'>
                                    {selectedGuide && `Enter the password to access "${selectedGuide.title}"`}
                                </DialogDescription>
                            </DialogHeader>
                            <div className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='guide-password' className='text-card-foreground'>
                                        Password
                                    </Label>
                                    <Input
                                        id='guide-password'
                                        type='password'
                                        placeholder='Enter guide password'
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className='bg-input border-border text-foreground'
                                        onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
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
                                        onClick={handlePasswordSubmit}
                                        disabled={!password}
                                        className='bg-primary hover:bg-primary/90 text-primary-foreground'
                                    >
                                        Access Guide
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <div className='text-center py-8 border-t border-border'>
                        <p className='text-sm text-muted-foreground'>© 2024 XERODMA. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
