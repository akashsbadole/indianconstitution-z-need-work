import { db } from '@/lib/db'

export interface SamplePrecedent {
  title: string
  citation: string
  summary: string
  keyPoints: string[]
  caseType: string
  court: string
  date: string
  isBinding: boolean
  tags: string[]
}

export interface SampleJudgment {
  caseNumber: string
  title: string
  description: string
  facts: string
  legalIssues: string
  caseType: string
  judgmentType: string
  summary: string
  fullText: string
  decision: string
  reasoning: string
  dateDelivered: string
  confidence: number
  biasScore: number
}

class DataSeedService {
  // Sample Indian legal precedents
  private samplePrecedents: SamplePrecedent[] = [
    {
      title: "Kesavananda Bharati v. State of Kerala",
      citation: "AIR 1973 SC 1461",
      summary: "Landmark case that established the Basic Structure doctrine of the Indian Constitution.",
      keyPoints: ["Basic Structure Doctrine", "Constitutional Amendment", "Fundamental Rights"],
      caseType: "Constitutional",
      court: "Supreme Court of India",
      date: "1973-04-24",
      isBinding: true,
      tags: ["constitution", "basic structure", "amendment", "fundamental rights"]
    },
    {
      title: "Maneka Gandhi v. Union of India",
      citation: "AIR 1978 SC 597",
      summary: "Expanded the interpretation of personal liberty and due process under Article 21.",
      keyPoints: ["Personal Liberty", "Due Process", "Article 21", "Natural Justice"],
      caseType: "Constitutional",
      court: "Supreme Court of India",
      date: "1978-01-25",
      isBinding: true,
      tags: ["personal liberty", "article 21", "due process", "natural justice"]
    },
    {
      title: "Vishakha v. State of Rajasthan",
      citation: "AIR 1997 SC 3011",
      summary: "Established guidelines to prevent sexual harassment at workplace.",
      keyPoints: ["Sexual Harassment", "Workplace Safety", "Gender Equality", "Guidelines"],
      caseType: "Labor Law",
      court: "Supreme Court of India",
      date: "1997-08-13",
      isBinding: true,
      tags: ["sexual harassment", "workplace", "gender equality", "women's rights"]
    },
    {
      title: "Shreya Singhal v. Union of India",
      citation: "AIR 2015 SC 1523",
      summary: "Struck down Section 66A of IT Act as unconstitutional, protecting online free speech.",
      keyPoints: ["Free Speech", "Internet Freedom", "Section 66A", "Unconstitutional"],
      caseType: "Cyber Law",
      court: "Supreme Court of India",
      date: "2015-03-24",
      isBinding: true,
      tags: ["free speech", "internet", "section 66a", "it act", "online speech"]
    },
    {
      title: "Naz Foundation v. Government of NCT of Delhi",
      citation: "160 (2009) DLT 277",
      summary: "Delhi High Court decriminalized consensual homosexual acts.",
      keyPoints: ["LGBTQ+ Rights", "Section 377", "Privacy", "Equality"],
      caseType: "Human Rights",
      court: "Delhi High Court",
      date: "2009-07-02",
      isBinding: false, // Later partially overturned by Supreme Court
      tags: ["lgbtq+", "section 377", "privacy", "equality", "human rights"]
    },
    {
      title: "S.R. Bommai v. Union of India",
      citation: "AIR 1994 SC 1918",
      summary: "Established guidelines for President's Rule under Article 356.",
      keyPoints: ["President's Rule", "Article 356", "Federal Structure", "Judicial Review"],
      caseType: "Constitutional",
      court: "Supreme Court of India",
      date: "1994-03-11",
      isBinding: true,
      tags: ["president's rule", "article 356", "federalism", "state government"]
    },
    {
      title: "Indra Sawhney v. Union of India",
      citation: "AIR 1993 SC 477",
      summary: "Upheld 27% reservation for OBCs with creamy layer exclusion.",
      keyPoints: ["Reservation", "OBC", "Creamy Layer", "Mandal Commission"],
      caseType: "Constitutional",
      court: "Supreme Court of India",
      date: "1992-11-16",
      isBinding: true,
      tags: ["reservation", "obc", "creamy layer", "mandal commission", "backward classes"]
    },
    {
      title: "MC Mehta v. Union of India",
      citation: "AIR 1987 SC 1086",
      summary: "Established absolute liability for hazardous industries.",
      keyPoints: ["Environmental Law", "Absolute Liability", "Hazardous Industries", "Public Safety"],
      caseType: "Environmental",
      court: "Supreme Court of India",
      date: "1987-12-20",
      isBinding: true,
      tags: ["environmental law", "absolute liability", "hazardous industries", "pollution"]
    }
  ]

  // Sample court data
  private sampleCourts = [
    {
      name: "Supreme Court of India",
      type: "SUPREME_COURT" as const,
      jurisdiction: "Entire India",
      location: "New Delhi",
      established: new Date("1950-01-28")
    },
    {
      name: "Delhi High Court",
      type: "HIGH_COURT" as const,
      jurisdiction: "Delhi",
      location: "New Delhi",
      established: new Date("1966-10-31")
    },
    {
      name: "Bombay High Court",
      type: "HIGH_COURT" as const,
      jurisdiction: "Maharashtra, Goa, Daman & Diu, Dadra & Nagar Haveli",
      location: "Mumbai",
      established: new Date("1862-08-14")
    }
  ]

  // Sample legal cases
  private sampleCases: SampleJudgment[] = [
    {
      caseNumber: "CASE-2024-001",
      title: "Property Dispute Between Family Members",
      description: "Dispute over ancestral property partition among siblings",
      facts: "The plaintiffs are siblings claiming equal share in ancestral property. The property was inherited by their father who died intestate. The defendant (elder brother) claims exclusive rights based on oral will and alleged financial contributions.",
      legalIssues: "Property rights, inheritance laws, succession, will validity",
      caseType: "Civil",
      judgmentType: "FINAL",
      summary: "Court ruled in favor of equal partition among all legal heirs as per Hindu Succession Act.",
      fullText: "Detailed judgment text outlining the legal reasoning and evidence presented...",
      decision: "Judgment in favor of plaintiffs for equal partition of property",
      reasoning: "Based on Hindu Succession Act, 1956 and lack of valid written will, all Class I heirs are entitled to equal shares.",
      dateDelivered: "2024-01-15",
      confidence: 0.85,
      biasScore: 0.1
    },
    {
      caseNumber: "CASE-2024-002", 
      title: "Employment Termination Dispute",
      description: "Wrongful termination of employee without proper procedure",
      facts: "Employee terminated after 15 years of service without notice or inquiry. Company claims poor performance but no documentation provided. Employee alleges discrimination and violation of labor laws.",
      legalIssues: "Labor laws, wrongful termination, due process, discrimination",
      caseType: "Labor",
      judgmentType: "FINAL",
      summary: "Court reinstated employee with back wages and compensation for illegal termination.",
      fullText: "Comprehensive analysis of employment contract, labor laws, and termination procedures...",
      decision: "Reinstatement of employee with full back wages and compensation",
      reasoning: "Termination violated principles of natural justice and Industrial Disputes Act. No proper inquiry conducted as per standing orders.",
      dateDelivered: "2024-01-10",
      confidence: 0.92,
      biasScore: 0.05
    },
    {
      caseNumber: "CASE-2024-003",
      title: "Criminal Appeal Against Conviction",
      description: "Appeal against lower court conviction in theft case",
      facts: "Appellant convicted of theft based on circumstantial evidence. No direct evidence, no recovery of stolen goods. Witnesses gave contradictory statements. Appellant claims alibi and false implication.",
      legalIssues: "Criminal procedure, evidence law, burden of proof, circumstantial evidence",
      caseType: "Criminal",
      judgmentType: "APPEAL",
      summary: "High Court acquitted appellant due to insufficient evidence and reasonable doubt.",
      fullText: "Detailed examination of evidence, witness credibility, and legal principles...",
      decision: "Acquittal of appellant due to benefit of doubt",
      reasoning: "Prosecution failed to prove guilt beyond reasonable doubt. Evidence was circumstantial and had inconsistencies.",
      dateDelivered: "2024-01-08",
      confidence: 0.78,
      biasScore: 0.12
    }
  ]

  async seedDatabase(): Promise<void> {
    console.log('Starting database seeding...')
    
    try {
      // Seed courts first
      await this.seedCourts()
      
      // Seed precedents
      await this.seedPrecedents()
      
      // Seed sample cases
      await this.seedCases()
      
      console.log('Database seeding completed successfully!')
    } catch (error) {
      console.error('Error seeding database:', error)
      throw error
    }
  }

  private async seedCourts(): Promise<void> {
    console.log('Seeding courts...')
    
    for (const courtData of this.sampleCourts) {
      try {
        await db.court.upsert({
          where: { name: courtData.name },
          update: courtData,
          create: courtData
        })
      } catch (error) {
        console.error(`Error seeding court ${courtData.name}:`, error)
      }
    }
  }

  private async seedPrecedents(): Promise<void> {
    console.log('Seeding precedents...')
    
    for (const precedentData of this.samplePrecedents) {
      try {
        await db.precedent.upsert({
          where: { citation: precedentData.citation },
          update: {
            title: precedentData.title,
            summary: precedentData.summary,
            keyPoints: JSON.stringify(precedentData.keyPoints),
            caseType: precedentData.caseType,
            court: precedentData.court,
            date: new Date(precedentData.date),
            isBinding: precedentData.isBinding,
            tags: JSON.stringify(precedentData.tags)
          },
          create: {
            title: precedentData.title,
            citation: precedentData.citation,
            summary: precedentData.summary,
            keyPoints: JSON.stringify(precedentData.keyPoints),
            caseType: precedentData.caseType,
            court: precedentData.court,
            date: new Date(precedentData.date),
            isBinding: precedentData.isBinding,
            tags: JSON.stringify(precedentData.tags)
          }
        })
      } catch (error) {
        console.error(`Error seeding precedent ${precedentData.title}:`, error)
      }
    }
  }

  private async seedCases(): Promise<void> {
    console.log('Seeding cases...')
    
    // Get default court
    const defaultCourt = await db.court.findFirst({
      where: { type: 'SUPREME_COURT' }
    })
    
    if (!defaultCourt) {
      throw new Error('Default court not found')
    }

    for (const caseData of this.sampleCases) {
      try {
        // Create the case
        const newCase = await db.legalCase.upsert({
          where: { caseNumber: caseData.caseNumber },
          update: {
            title: caseData.title,
            description: caseData.description,
            facts: caseData.facts,
            legalIssues: caseData.legalIssues,
            caseType: caseData.caseType,
            status: 'CLOSED',
            courtId: defaultCourt.id,
            priority: 1
          },
          create: {
            caseNumber: caseData.caseNumber,
            title: caseData.title,
            description: caseData.description,
            facts: caseData.facts,
            legalIssues: caseData.legalIssues,
            caseType: caseData.caseType,
            status: 'CLOSED',
            courtId: defaultCourt.id,
            priority: 1,
            filingDate: new Date(caseData.dateDelivered)
          }
        })

        // Create judgment for the case
        await db.judgment.upsert({
          where: { caseId: newCase.id },
          update: {
            judgeId: 'default-judge-id',
            courtId: defaultCourt.id,
            judgmentType: caseData.judgmentType as any,
            summary: caseData.summary,
            fullText: caseData.fullText,
            decision: caseData.decision,
            reasoning: caseData.reasoning,
            dateDelivered: new Date(caseData.dateDelivered),
            isPublished: true,
            confidence: caseData.confidence,
            biasScore: caseData.biasScore
          },
          create: {
            caseId: newCase.id,
            judgeId: 'default-judge-id',
            courtId: defaultCourt.id,
            judgmentType: caseData.judgmentType as any,
            summary: caseData.summary,
            fullText: caseData.fullText,
            decision: caseData.decision,
            reasoning: caseData.reasoning,
            dateDelivered: new Date(caseData.dateDelivered),
            isPublished: true,
            confidence: caseData.confidence,
            biasScore: caseData.biasScore
          }
        })

      } catch (error) {
        console.error(`Error seeding case ${caseData.title}:`, error)
      }
    }
  }

  async getSeedingStats(): Promise<any> {
    try {
      const [courtsCount, precedentsCount, casesCount, judgmentsCount] = await Promise.all([
        db.court.count(),
        db.precedent.count(),
        db.legalCase.count(),
        db.judgment.count()
      ])

      return {
        courts: courtsCount,
        precedents: precedentsCount,
        cases: casesCount,
        judgments: judgmentsCount
      }
    } catch (error) {
      console.error('Error getting seeding stats:', error)
      return { courts: 0, precedents: 0, cases: 0, judgments: 0 }
    }
  }
}

export const dataSeedService = new DataSeedService()