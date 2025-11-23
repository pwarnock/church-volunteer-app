import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create demo users
  const demoUsers = [
    {
      name: 'John Volunteer',
      email: 'volunteer@demo.com',
      password: 'password123',
      role: 'VOLUNTEER'
    },
    {
      name: 'Sarah Leader',
      email: 'leader@demo.com', 
      password: 'password123',
      role: 'MINISTRY_LEADER'
    },
    {
      name: 'Mike Volunteer',
      email: 'mike@demo.com',
      password: 'password123', 
      role: 'VOLUNTEER'
    }
  ]

  for (const userData of demoUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 12)
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      }
    })
    
    console.log(`✅ Created user: ${user.name} (${user.email})`)
  }

  // Get created users
  const volunteer = await prisma.user.findUnique({ where: { email: 'volunteer@demo.com' } })
  const leader = await prisma.user.findUnique({ where: { email: 'leader@demo.com' } })

  if (volunteer && leader) {
    // Create volunteer profile
    await prisma.volunteerProfile.upsert({
      where: { userId: volunteer.id },
      update: {},
      create: {
        userId: volunteer.id,
        bio: 'Passionate about serving in children ministry and community outreach',
        spiritualGifts: JSON.stringify(['Teaching', 'Shepherding', 'Service']),
        interests: JSON.stringify(['Children Ministry', 'Community Outreach', 'Youth Programs']),
        availability: JSON.stringify({
          weekdays: ['Evenings'],
          weekends: ['Saturday morning', 'Sunday afternoon']
        }),
        skills: JSON.stringify(['Teaching', 'Mentoring', 'Event Planning']),
        experience: '2 years volunteering in children ministry'
      }
    })

    // Create demo opportunities
    const opportunities = [
      {
        title: 'Sunday School Teacher',
        description: 'Teach children ages 5-8 during Sunday school hour. Curriculum provided.',
        ministry: 'Children Ministry',
        location: 'Main Building - Classroom 2',
        requirements: JSON.stringify(['Background check', 'Teaching experience preferred', 'Love for children']),
        timeCommitment: '2 hours per week',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        leaderId: leader.id
      },
      {
        title: 'Community Outreach Volunteer',
        description: 'Help organize and run monthly community outreach events in local neighborhoods.',
        ministry: 'Community Outreach',
        location: 'Various Locations',
        requirements: JSON.stringify(['Valid drivers license', 'Good communication skills', 'Flexible schedule']),
        timeCommitment: '4-6 hours per month',
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
        leaderId: leader.id
      },
      {
        title: 'Youth Group Mentor',
        description: 'Mentor high school students in weekly youth group meetings and activities.',
        ministry: 'Youth Ministry',
        location: 'Youth Center',
        requirements: JSON.stringify(['Background check', 'Experience with teenagers', 'Good listener']),
        timeCommitment: '3 hours per week',
        startDate: new Date(),
        endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
        leaderId: leader.id
      }
    ]

    for (const oppData of opportunities) {
      const opportunity = await prisma.opportunity.create({
        data: oppData
      })
      console.log(`✅ Created opportunity: ${opportunity.title}`)
    }

    // Create demo applications
    const sundaySchool = await prisma.opportunity.findFirst({ 
      where: { title: 'Sunday School Teacher' } 
    })
    
    if (sundaySchool) {
      await prisma.application.create({
        data: {
          opportunityId: sundaySchool.id,
          volunteerId: volunteer.id,
          message: 'I have experience teaching children and would love to serve in this role!'
        }
      })
      console.log(`✅ Created application for ${volunteer.name}`)
    }
  }

  console.log('🎉 Database seeding completed!')
  console.log('\n📋 Demo Login Credentials:')
  console.log('─────────────────────────────────────')
  console.log('👤 VOLUNTEER ACCOUNT:')
  console.log('   Email: volunteer@demo.com')
  console.log('   Password: password123')
  console.log('')
  console.log('👤 MINISTRY LEADER ACCOUNT:')
  console.log('   Email: leader@demo.com')
  console.log('   Password: password123')
  console.log('')
  console.log('👤 SECOND VOLUNTEER:')
  console.log('   Email: mike@demo.com')
  console.log('   Password: password123')
  console.log('─────────────────────────────────────')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })