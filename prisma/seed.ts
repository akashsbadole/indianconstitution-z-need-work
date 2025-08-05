import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create sample precedents
  const precedents = [
    {
      title: 'Kesavananda Bharati v. State of Kerala',
      citation: 'AIR 1973 SC 1461',
      summary: 'Landmark case that established the Basic Structure doctrine of the Indian Constitution.',
      keyPoints: JSON.stringify(['Basic Structure Doctrine', 'Constitutional Amendment', 'Fundamental Rights']),
      caseType: 'Constitutional',
      court: 'Supreme Court of India',
      date: new Date('1973-04-24'),
      isBinding: true,
      tags: JSON.stringify(['fundamental rights', 'constitutional amendment', 'basic structure'])
    },
    {
      title: 'Maneka Gandhi v. Union of India',
      citation: 'AIR 1978 SC 597',
      summary: 'Expanded the interpretation of personal liberty under Article 21 and established the procedure established by law test.',
      keyPoints: JSON.stringify(['Personal Liberty', 'Due Process', 'Natural Justice']),
      caseType: 'Constitutional',
      court: 'Supreme Court of India',
      date: new Date('1978-01-25'),
      isBinding: true,
      tags: JSON.stringify(['article 21', 'personal liberty', 'natural justice'])
    },
    {
      title: 'Vishakha v. State of Rajasthan',
      citation: 'AIR 1997 SC 3011',
      summary: 'Established guidelines to prevent sexual harassment at workplace and filled legislative vacuum.',
      keyPoints: JSON.stringify(['Sexual Harassment', 'Gender Equality', 'Workplace Safety']),
      caseType: 'Civil',
      court: 'Supreme Court of India',
      date: new Date('1997-08-13'),
      isBinding: true,
      tags: JSON.stringify(['sexual harassment', 'gender equality', 'workplace guidelines'])
    },
    {
      title: 'Shreya Singhal v. Union of India',
      citation: 'AIR 2015 SC 1523',
      summary: 'Struck down Section 66A of IT Act as unconstitutional, protecting freedom of speech online.',
      keyPoints: JSON.stringify(['Freedom of Speech', 'Internet Freedom', 'Constitutional Validity']),
      caseType: 'Constitutional',
      court: 'Supreme Court of India',
      date: new Date('2015-03-24'),
      isBinding: true,
      tags: JSON.stringify(['freedom of speech', 'internet', 'section 66a'])
    },
    {
      title: 'Naz Foundation v. Government of NCT of Delhi',
      citation: '160 (2009) DLT 277',
      summary: 'Decriminalized consensual homosexual acts between adults, interpreting Article 15 read with Article 21.',
      keyPoints: JSON.stringify(['LGBTQ+ Rights', 'Privacy', 'Non-discrimination']),
      caseType: 'Criminal',
      court: 'Delhi High Court',
      date: new Date('2009-07-02'),
      isBinding: false,
      tags: JSON.stringify(['lgbtq+ rights', 'privacy', 'article 15'])
    }
  ]

  for (const precedent of precedents) {
    await prisma.precedent.create({
      data: precedent
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })