"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  ArrowLeft, Users, Plus, Phone, Mail, Calendar, Briefcase,
  Star, Clock, CheckCircle, TrendingUp, Truck, Shield
} from 'lucide-react'

// Demo team data
const teamMembers = [
  { 
    id: 1, 
    name: 'Marcus Johnson', 
    role: 'Lead Arborist', 
    team: 'Team Alpha',
    phone: '(512) 555-0101',
    email: 'marcus@blackbear.com',
    status: 'active',
    jobsCompleted: 156,
    rating: 4.9,
    certifications: ['ISA Certified', 'CTSP'],
    joined: '2022-03-15',
    todayStatus: 'on_job',
    currentJob: 'Tree removal at 123 Oak St'
  },
  { 
    id: 2, 
    name: 'Sarah Chen', 
    role: 'Crew Lead', 
    team: 'Team Alpha',
    phone: '(512) 555-0102',
    email: 'sarah@blackbear.com',
    status: 'active',
    jobsCompleted: 124,
    rating: 4.8,
    certifications: ['ISA Certified'],
    joined: '2022-06-20',
    todayStatus: 'on_job',
    currentJob: 'Tree removal at 123 Oak St'
  },
  { 
    id: 3, 
    name: 'David Martinez', 
    role: 'Climber', 
    team: 'Team Alpha',
    phone: '(512) 555-0103',
    email: 'david@blackbear.com',
    status: 'active',
    jobsCompleted: 98,
    rating: 4.7,
    certifications: ['Climbing Specialist'],
    joined: '2023-01-10',
    todayStatus: 'on_job',
    currentJob: 'Tree removal at 123 Oak St'
  },
  { 
    id: 4, 
    name: 'James Wilson', 
    role: 'Crew Lead', 
    team: 'Team Beta',
    phone: '(512) 555-0201',
    email: 'james@blackbear.com',
    status: 'active',
    jobsCompleted: 112,
    rating: 4.6,
    certifications: ['ISA Certified', 'Equipment Operator'],
    joined: '2022-09-01',
    todayStatus: 'available',
    currentJob: null
  },
  { 
    id: 5, 
    name: 'Mike Thompson', 
    role: 'Ground Crew', 
    team: 'Team Beta',
    phone: '(512) 555-0202',
    email: 'mike@blackbear.com',
    status: 'active',
    jobsCompleted: 87,
    rating: 4.5,
    certifications: [],
    joined: '2023-04-15',
    todayStatus: 'available',
    currentJob: null
  },
  { 
    id: 6, 
    name: 'Emily Rodriguez', 
    role: 'Stump Specialist', 
    team: 'Team Beta',
    phone: '(512) 555-0203',
    email: 'emily@blackbear.com',
    status: 'off',
    jobsCompleted: 65,
    rating: 4.8,
    certifications: ['Stump Grinding Certified'],
    joined: '2023-08-01',
    todayStatus: 'day_off',
    currentJob: null
  },
]

const teams = [
  { name: 'Team Alpha', members: 3, activeJob: 'Tree removal at 123 Oak St', status: 'on_job' },
  { name: 'Team Beta', members: 3, activeJob: null, status: 'available' },
]

export default function TeamPage() {
  const [selectedMember, setSelectedMember] = useState<typeof teamMembers[0] | null>(null)
  const [showAddMember, setShowAddMember] = useState(false)

  const activeMembers = teamMembers.filter(m => m.status === 'active').length
  const onJobMembers = teamMembers.filter(m => m.todayStatus === 'on_job').length
  const availableMembers = teamMembers.filter(m => m.todayStatus === 'available').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on_job':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">On Job</Badge>
      case 'available':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Available</Badge>
      case 'day_off':
        return <Badge className="bg-secondary text-muted-foreground">Day Off</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="size-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="size-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Team Management</h1>
                  <p className="text-sm text-muted-foreground">Manage crews and team members</p>
                </div>
              </div>
            </div>
            <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
              <DialogTrigger>
                <Button>
                  <Plus className="size-4 mr-2" />
                  Add Team Member
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Add New Team Member</DialogTitle>
                  <DialogDescription>Enter the details for the new team member</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input placeholder="Enter name" className="bg-secondary/50 border-border" />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input placeholder="e.g., Climber, Ground Crew" className="bg-secondary/50 border-border" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Phone</Label>
                      <Input placeholder="(512) 555-0000" className="bg-secondary/50 border-border" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" placeholder="email@blackbear.com" className="bg-secondary/50 border-border" />
                    </div>
                  </div>
                  <div>
                    <Label>Assign to Team</Label>
                    <Input placeholder="Team Alpha or Team Beta" className="bg-secondary/50 border-border" />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowAddMember(false)}>Cancel</Button>
                    <Button>Add Member</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Team</p>
                  <p className="text-2xl font-bold">{teamMembers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Truck className="size-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">On Job</p>
                  <p className="text-2xl font-bold text-blue-500">{onJobMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="size-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold text-green-500">{availableMembers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Briefcase className="size-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Crews</p>
                  <p className="text-2xl font-bold">{teams.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teams Overview */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {teams.map(team => (
            <Card key={team.name} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="size-5 text-primary" />
                    {team.name}
                  </CardTitle>
                  {team.status === 'on_job' ? (
                    <Badge className="bg-blue-500/20 text-blue-500">On Job</Badge>
                  ) : (
                    <Badge className="bg-green-500/20 text-green-500">Available</Badge>
                  )}
                </div>
                <CardDescription>
                  {team.activeJob || 'No active assignment'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex -space-x-2">
                  {teamMembers.filter(m => m.team === team.name).map(member => (
                    <Avatar key={member.id} className="border-2 border-background size-10">
                      <AvatarFallback className="bg-primary/20 text-primary text-sm">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3">{team.members} members</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team Members List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>All Team Members</CardTitle>
            <CardDescription>Click a member to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teamMembers.map(member => (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role} - {member.team}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="size-4 text-amber-500 fill-amber-500" />
                        <span className="font-medium">{member.rating}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{member.jobsCompleted} jobs</p>
                    </div>
                    {getStatusBadge(member.todayStatus)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Member Detail Modal */}
        {selectedMember && (
          <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
            <DialogContent className="bg-card border-border max-w-lg">
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="size-16">
                    <AvatarFallback className="bg-primary/20 text-primary text-xl">
                      {selectedMember.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-xl">{selectedMember.name}</DialogTitle>
                    <DialogDescription>{selectedMember.role} - {selectedMember.team}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {/* Status */}
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="text-muted-foreground">Current Status</span>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedMember.todayStatus)}
                    {selectedMember.currentJob && (
                      <span className="text-sm text-muted-foreground">- {selectedMember.currentJob}</span>
                    )}
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="size-4 text-muted-foreground" />
                    {selectedMember.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="size-4 text-muted-foreground" />
                    {selectedMember.email}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="size-4 text-amber-500 fill-amber-500" />
                      <span className="text-xl font-bold">{selectedMember.rating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div className="text-center p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xl font-bold">{selectedMember.jobsCompleted}</p>
                    <p className="text-xs text-muted-foreground">Jobs Done</p>
                  </div>
                  <div className="text-center p-3 bg-secondary/30 rounded-lg">
                    <p className="text-xl font-bold">{new Date().getFullYear() - new Date(selectedMember.joined).getFullYear()}y</p>
                    <p className="text-xs text-muted-foreground">Experience</p>
                  </div>
                </div>

                {/* Certifications */}
                {selectedMember.certifications.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Shield className="size-4 text-primary" />
                      Certifications
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.certifications.map(cert => (
                        <Badge key={cert} variant="outline" className="border-primary/30 text-primary">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button variant="outline" className="flex-1">
                    <Phone className="size-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Mail className="size-4 mr-2" />
                    Message
                  </Button>
                  <Button className="flex-1">
                    <Calendar className="size-4 mr-2" />
                    Assign Job
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  )
}
