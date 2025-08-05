import { NextRequest, NextResponse } from 'next/server'
import { constitutionService } from '@/lib/services/constitutionService'

// Sample Constitution data based on the provided PDF
// In a real implementation, you would parse the actual PDF
const sampleConstitutionData = `THE CONSTITUTION OF INDIA
PREAMBLE
WE, THE PEOPLE OF INDIA, having solemnly resolved to constitute India into a SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC and to secure to all its citizens:
JUSTICE, social, economic and political;
LIBERTY of thought, expression, belief, faith and worship;
EQUALITY of status and of opportunity;
and to promote among them all
FRATERNITY assuring the dignity of the individual and the unity and integrity of the Nation;
IN OUR CONSTITUENT ASSEMBLY this twenty-sixth day of November, 1949, do HEREBY ADOPT, ENACT AND GIVE TO OURSELVES THIS CONSTITUTION.

PART I
THE UNION AND ITS TERRITORY
1. Name and territory of the Union.—(1) India, that is Bharat, shall be a Union of States.
(2) The States and the territories thereof shall be as specified in the First Schedule.
(3) The territory of India shall comprise—
(a) the territories of the States;
(b) the Union territories specified in the First Schedule; and
(c) such other territories as may be acquired.

2. Admission or establishment of new States.—Parliament may by law admit into the Union, or establish, new States on such terms and conditions as it thinks fit.

3. Formation of new States and alteration of areas, boundaries or names of existing States.—Parliament may by law—
(a) form a new State by separation of territory from any State or by uniting two or more States or parts of States or by uniting any territory to a part of any State;
(b) increase the area of any State;
(c) diminish the area of any State;
(d) alter the boundaries of any State;
(e) alter the name of any State.

4. Laws made under articles 2 and 3 to provide for the amendment of the First and the Fourth Schedules and supplemental, incidental and consequential matters.—(1) Any law referred to in article 2 or article 3 shall contain such provisions for the amendment of the First Schedule and the Fourth Schedule as may be necessary to give effect to the provisions of the law and may also contain such supplemental, incidental and consequential provisions (including provisions as to representation in Parliament and in the Legislature or Legislatures of the State or States affected by such law) as Parliament may deem necessary.

PART II
CITIZENSHIP
5. Citizenship at the commencement of the Constitution.—At the commencement of this Constitution, every person who has his domicile in the territory of India and—
(a) who was born in the territory of India; or
(b) either of whose parents was born in the territory of India; or
(c) who has been ordinarily resident in the territory of India for not less than five years immediately preceding such commencement,
shall be a citizen of India.

6. Rights of citizenship of certain persons who have migrated to India from Pakistan.—Notwithstanding anything in article 5, a person who has migrated to the territory of India from the territory now included in Pakistan shall be deemed to be a citizen of India at the commencement of this Constitution if—
(a) he or either of his parents or any of his grand-parents was born in India as defined in the Government of India Act, 1935 (as originally enacted); and
(b)(i) in the case where such person has so migrated before the nineteenth day of July, 1948, he has been ordinarily resident in the territory of India since the date of his migration, or
(ii) in the case where such person has so migrated on or after the nineteenth day of July, 1948, he has been registered as a citizen of India by an officer appointed in that behalf by the Government of the Dominion of India on an application made by him therefor to such officer before the commencement of this Constitution in the form and manner prescribed by that Government.

7. Rights of citizenship of certain migrants to Pakistan.—Notwithstanding anything in articles 5 and 6, a person who has after the first day of March, 1947, migrated from the territory of India to the territory now included in Pakistan shall not be deemed to be a citizen of India.

8. Rights of citizenship of certain persons of Indian origin residing outside India.—Notwithstanding anything in article 5, any person who or either of whose parents or any of whose grand-parents was born in India as defined in the Government of India Act, 1935 (as originally enacted), and who is ordinarily residing in any country outside India as so defined shall be deemed to be a citizen of India if he has been registered as a citizen of India by the diplomatic or consular representative of India in the country where he is for the time being residing on an application made by him therefor to such diplomatic or consular representative, whether before or after the commencement of this Constitution, in the form and manner prescribed by the Government of the Dominion of India or the Government of India.

9. Persons voluntarily acquiring citizenship of a foreign State not to be citizens.—No person shall be a citizen of India by virtue of article 5, or be deemed to be a citizen of India by virtue of article 6 or article 8, if he has voluntarily acquired the citizenship of any foreign State.

10. Continuance of the rights of citizenship.—Every person who is or is deemed to be a citizen of India under any of the foregoing provisions of this Part shall, subject to the provisions of any law that may be made by Parliament, continue to be such citizen.

11. Parliament to regulate the right of citizenship by law.—Nothing in the foregoing provisions of this Part shall derogate from the power of Parliament to make any provision with respect to the acquisition and termination of citizenship and all other matters relating to citizenship.

PART III
FUNDAMENTAL RIGHTS
General
12. Definition.—In this Part, unless the context otherwise requires, "the State" includes the Government and Parliament of India and the Government and the Legislature of each of the States and all local or other authorities within the territory of India or under the control of the Government of India.

13. Laws inconsistent with or in derogation of the fundamental rights.—(1) All laws in force in the territory of India immediately before the commencement of this Constitution, in so far as they are inconsistent with the provisions of this Part, shall, to the extent of such inconsistency, be void.
(2) The State shall not make any law which takes away or abridges the rights conferred by this Part and any law made in contravention of this clause shall, to the extent of the contravention, be void.

Right to Equality
14. Equality before law.—The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.

15. Prohibition of discrimination on grounds of religion, race, caste, sex or place of birth.—(1) The State shall not discriminate against any citizen on grounds only of religion, race, caste, sex, place of birth or any of them.
(2) No citizen shall, on grounds only of religion, race, caste, sex, place of birth or any of them, be subject to any disability, liability, restriction or condition with regard to—
(a) access to shops, public restaurants, hotels and places of public entertainment; or
(b) the use of wells, tanks, bathing ghats, roads and places of public resort maintained wholly or partly out of State funds or dedicated to the use of the general public.

16. Equality of opportunity in matters of public employment.—(1) There shall be equality of opportunity for all citizens in matters relating to employment under the State.
(2) No citizen shall, on grounds only of religion, race, caste, sex, descent, place of birth, residence or any of them, be ineligible for, or discriminated against in respect of, any employment or office under the State.

17. Abolition of Untouchability.—"Untouchability" is abolished and its practice in any form is forbidden. The enforcement of any disability arising out of "Untouchability" shall be an offence punishable in accordance with law.

18. Abolition of titles.—No title, not being a military or academic distinction, shall be conferred by the State. No citizen of India shall accept any title from any foreign State.

Right to Freedom
19. Protection of certain rights regarding freedom of speech, etc.—(1) All citizens shall have the right—
(a) to freedom of speech and expression;
(b) to assemble peaceably and without arms;
(c) to form associations or unions;
(d) to move freely throughout the territory of India;
(e) to reside and settle in any part of the territory of India; and
(f) to practise any profession, or to carry on any occupation, trade or business.

20. Protection in respect of conviction for offences.—(1) No person shall be convicted of any offence except for violation of a law in force at the time of the commission of the Act charged as an offence, nor be subjected to a penalty greater than that which might have been inflicted under the law in force at the time of the commission of the offence.
(2) No person shall be prosecuted and punished for the same offence more than once.
(3) No person accused of any offence shall be compelled to be a witness against himself.

21. Protection of life and personal liberty.—No person shall be deprived of his life or personal liberty except according to procedure established by law.

21A. Right to education.—The State shall provide free and compulsory education to all children of the age of six to fourteen years in such manner as the State may, by law, determine.

22. Protection against arrest and detention in certain cases.—(1) No person who is arrested shall be detained in custody without being informed, as soon as may be, of the grounds for such arrest nor shall he be denied the right to consult, and to be defended by, a legal practitioner of his choice.
(2) Every person who is arrested and detained in custody shall be produced before the nearest magistrate within a period of twenty-four hours of such arrest excluding the time necessary for the journey from the place of arrest to the court of the magistrate and no such person shall be detained in custody beyond the said period without the authority of a magistrate.

Right against Exploitation
23. Prohibition of traffic in human beings and forced labour.—(1) Traffic in human beings and begar and other similar forms of forced labour are prohibited and any contravention of this provision shall be an offence punishable in accordance with law.
(2) Nothing in this article shall prevent the State from imposing compulsory service for public purposes, and in imposing such service the State shall not make any discrimination on grounds only of religion, race, caste or class or any of them.

24. Prohibition of employment of children in factories, etc.—No child below the age of fourteen years shall be employed to work in any factory or mine or engaged in any other hazardous employment.

Right to Freedom of Religion
25. Freedom of conscience and free profession, practice and propagation of religion.—(1) Subject to public order, morality and health and to the other provisions of this Part, all persons are equally entitled to freedom of conscience and the right freely to profess, practise and propagate religion.
(2) Nothing in this article shall affect the operation of any existing law or prevent the State from making any law—
(a) regulating or restricting any economic, financial, political or other secular activity which may be associated with religious practice;
(b) providing for social welfare and reform or the throwing open of Hindu religious institutions of a public character to all classes and sections of Hindus.

26. Freedom to manage religious affairs.—Subject to public order, morality and health, every religious denomination or any section thereof shall have the right—
(a) to establish and maintain institutions for religious and charitable purposes;
(b) to manage its own affairs in matters of religion;
(c) to own and acquire movable and immovable property; and
(d) to administer such property in accordance with law.

27. Freedom as to payment of taxes for promotion of any particular religion.—No person shall be compelled to pay taxes for the promotion of any particular religion.

28. Freedom as to attendance at religious instruction or religious worship in certain educational institutions.—No religious instruction shall be provided in any educational institution wholly maintained out of State funds.

Cultural and Educational Rights
29. Protection of interests of minorities.—Any section of the citizens residing in the territory of India or any part thereof having a distinct language, script or culture of its own shall have the right to conserve the same.

30. Right of minorities to establish and administer educational institutions.—(1) All minorities, whether based on religion or language, shall have the right to establish and administer educational institutions of their choice.
(2) The State shall not, in granting aid to educational institutions, discriminate against any educational institution on the ground that it is under the management of a minority, whether based on religion or language.

Right to Constitutional Remedies
32. Remedies for enforcement of rights conferred by this Part.—(1) The right to move the Supreme Court by appropriate proceedings for the enforcement of the rights conferred by this Part is guaranteed.
(2) The Supreme Court shall have power to issue directions or orders or writs, including writs in the nature of habeas corpus, mandamus, prohibition, quo warranto and certiorari, whichever may be appropriate, for the enforcement of any of the rights conferred by this Part.
(3) Without prejudice to the powers conferred on the Supreme Court by clauses (1) and (2), Parliament may by law empower any other court to exercise within the local limits of its jurisdiction all or any of the powers exercisable by the Supreme Court under clause (2).
(4) The right guaranteed by this article shall not be suspended except as otherwise provided for by this Constitution.`

export async function POST(request: NextRequest) {
  try {
    console.log('Starting Constitution data loading...')
    
    // Process the Constitution data
    await constitutionService.processConstitutionText(sampleConstitutionData)
    
    // Get statistics after loading
    const stats = await constitutionService.getConstitutionStats()
    
    return NextResponse.json({
      success: true,
      message: 'Constitution data loaded successfully',
      stats: {
        totalArticles: stats.totalArticles,
        categories: stats.categories
      }
    })

  } catch (error) {
    console.error('Error loading Constitution data:', error)
    return NextResponse.json(
      { error: 'Failed to load Constitution data', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Check if Constitution data is already loaded
    const stats = await constitutionService.getConstitutionStats()
    
    return NextResponse.json({
      success: true,
      isLoaded: stats.totalArticles > 0,
      stats: {
        totalArticles: stats.totalArticles,
        categories: stats.categories
      }
    })

  } catch (error) {
    console.error('Error checking Constitution data status:', error)
    return NextResponse.json(
      { error: 'Failed to check Constitution data status', details: error.message },
      { status: 500 }
    )
  }
}