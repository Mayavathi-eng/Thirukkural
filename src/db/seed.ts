import { count } from 'drizzle-orm';
import { db } from './index.ts';
import {
  activities,
  articles,
  classes,
  kuralChapters,
  kurals,
  meditations,
  presentations,
  quizQuestions,
  quizzes,
  siteSettings,
  studyMaterials,
  vedantaCategories,
} from './schema.ts';
import { ALL_KURAL_CHAPTERS } from './kuralChaptersData.ts';
import { AUTHENTIC_KURALS } from './seedData.ts';

let seedPromise: Promise<void> | null = null;
let seeded = false;

export async function ensureSeeded(): Promise<void> {
  if (seeded) return;
  if (seedPromise) return seedPromise;

  seedPromise = runSeed()
    .then(() => {
      seeded = true;
    })
    .catch((err) => {
      seedPromise = null;
      throw err;
    });

  return seedPromise;
}

async function runSeed() {
  const [{ value: chapterCount }] = await db.select({ value: count() }).from(kuralChapters);
  if (chapterCount === 0) {
    await db.insert(kuralChapters).values(ALL_KURAL_CHAPTERS).onConflictDoNothing();
  }

  const [{ value: kuralCount }] = await db.select({ value: count() }).from(kurals);
  if (kuralCount === 0) {
    const chapterMap = new Map(ALL_KURAL_CHAPTERS.map((c) => [c.chapterNumber, c]));
    const rows = AUTHENTIC_KURALS.map((k) => {
      const ch = chapterMap.get(k.chapterNumber)!;
      return {
        number: k.number,
        chapterNumber: k.chapterNumber,
        divisionEn: ch.divisionEn,
        divisionTa: ch.divisionTa,
        chapterNameEn: ch.nameEn,
        chapterNameTa: ch.nameTa,
        line1Ta: k.line1Ta,
        line2Ta: k.line2Ta,
        transliteration: k.transliteration,
        wordByWordTa: k.wordByWordTa,
        simpleExplanationTa: k.simpleExplanationTa,
        commentaryTa: k.commentaryTa,
        translationEn: k.translationEn,
        explanationEn: k.explanationEn,
        audioUrl: `/api/media/audio/kural-${k.number}`,
        studyPdfUrl: `/api/media/pdf/kural-${k.number}`,
        featured: Boolean(k.featured),
      };
    });
    await db.insert(kurals).values(rows).onConflictDoNothing();
  }

  const [{ value: catCount }] = await db.select({ value: count() }).from(vedantaCategories);
  if (catCount === 0) {
    await db
      .insert(vedantaCategories)
      .values([
        {
          slug: 'introduction',
          titleEn: 'Introduction to Vedanta',
          titleTa: 'அறிமுகம் — வேதாந்த அடிப்படைகள்',
          descriptionEn:
            'Foundational orientation to Vedanta philosophy, the four qualifications of a seeker (Sadhana Chatushtaya), and the harmony of Thirukkural ethics with inner inquiry.',
          descriptionTa:
            'வேதாந்த தத்துவத்தின் அடிப்படைக் கொள்கைகள், சாதன சதுஷ்டயம், மற்றும் திருக்குறள் அறவியலுக்கும் ஆன்ம விசாரணைக்கும் உள்ள இணக்கம்.',
          sortOrder: 1,
        },
        {
          slug: 'bhagavad-gita',
          titleEn: 'Bhagavad Gita',
          titleTa: 'பகவத்கீதை',
          descriptionEn:
            'Chapter-by-chapter discourses by Swamiji exploring Karma Yoga, Bhakti Yoga, Dhyana Yoga, and Jnana Yoga for daily clarity and inner steadiness.',
          descriptionTa:
            'கர்ம யோகம், பக்தி யோகம், தியான யோகம் மற்றும் ஞான யோகத்தை அன்றாட வாழ்வோடு இணைக்கும் சுவாமிஜியின் பகவத்கீதை வகுப்புகள்.',
          sortOrder: 2,
        },
        {
          slug: 'upanishads',
          titleEn: 'Upanishads',
          titleTa: 'உபநிஷத்துக்கள்',
          descriptionEn:
            'Contemplative study of Isha, Kena, Katha, Mundaka, and Mandukya Upanishads revealing the luminous nature of Atman and Brahman.',
          descriptionTa:
            'ஈசாவாஸ்ய, கேன, கட, முண்டக மற்றும் மாண்டூக்ய உபநிஷத்துக்களின் சாரத்தை எளிய தமிழில் விளக்கும் ஆழ்ந்த வகுப்புகள்.',
          sortOrder: 3,
        },
        {
          slug: 'vedantic-texts',
          titleEn: 'Vedantic Texts (Prakarana Granthas)',
          titleTa: 'வேதாந்த நூல்கள்',
          descriptionEn:
            'Classical introductory treatises including Tattva Bodha, Atma Bodha, Vivekachudamani, and Kaivalya Navaneetham in Tamil.',
          descriptionTa:
            'தத்துவ போதம், ஆத்ம போதம், விவேகசூடாமணி மற்றும் கைவல்ய நவநீதம் ஆகிய தமிழ்-சம்ஸ்கிருத வேதாந்த நூல்களின் விளக்கவுரைகள்.',
          sortOrder: 4,
        },
        {
          slug: 'brahma-sutram',
          titleEn: 'Brahma Sutram',
          titleTa: 'ப்ரம்ம சூத்ரம்',
          descriptionEn:
            'Systematic inquiry into the aphorisms of Sage Badarayana with Adi Shankara’s Advaita Vedanta commentary.',
          descriptionTa:
            'வேதவியாசரின் பிரம்ம சூத்திரங்களுக்கு ஆதி சங்கரரின் அத்வைத பாஷ்ய அடிப்படையிலான முறையான சிந்தனை வகுப்புகள்.',
          sortOrder: 5,
        },
        {
          slug: 'general-talks',
          titleEn: 'General Talks & Discourses',
          titleTa: 'வேதாந்த சொற்பொழிவுகள்',
          descriptionEn:
            'Public discourses connecting Tirukkural wisdom, Saint Tayumanavar, Ramana Maharshi, and practical Vedanta for youth and families.',
          descriptionTa:
            'திருக்குறள், தாயுமானவர், ரமண மகரிஷி ஆகியோரின் அருள்மொழிகளை இளைஞர்கள் மற்றும் குடும்பத்தினருக்கு இணைக்கும் பொதுச் சொற்பொழிவுகள்.',
          sortOrder: 6,
        },
        {
          slug: 'guided-meditation',
          titleEn: 'Guided Meditation & Dhyana',
          titleTa: 'த்யானம் — வழிகாட்டப்பட்ட தியானம்',
          descriptionEn:
            'Practical guided meditation sessions, pranayama breathing rhythms, and silent awareness contemplations taught by Swamiji.',
          descriptionTa:
            'சுவாமிஜியின் குரலிலும் வழிகாட்டலிலும் அமைந்த பிராணாயாமம், சாந்தி மந்திரம் மற்றும் ஆழ்ந்த மௌன தியானப் பயிற்சிகள்.',
          sortOrder: 7,
        },
      ])
      .onConflictDoNothing();
  }

  const [{ value: classCount }] = await db.select({ value: count() }).from(classes);
  if (classCount === 0) {
    await db
      .insert(classes)
      .values([
        {
          slug: 'intro-sadhana-chatushtaya',
          categorySlug: 'introduction',
          chapterTitleEn: 'Module 01 · Foundations of Inquiry',
          chapterTitleTa: 'பகுதி 01 · விசாரணையின் அடிப்படை',
          titleEn: 'What is Vedanta? Purpose of Human Life & Fourfold Qualifications',
          titleTa: 'வேதாந்தம் என்றால் என்ன? சாதன சதுஷ்டயம் ஓர் அறிமுகம்',
          descriptionEn:
            'Swamiji introduces the meaning of Veda-Anta (culmination of knowledge) and how Viveka, Vairagya, Shatsampatti, and Mumukshutva prepare the mind for lasting peace.',
          descriptionTa:
            'வேதங்களின் முடிவான ஞானமே வேதாந்தம். விவேகம், வைராக்கியம், ஷட்சம்பத்தி, முமுக்ஷுத்வம் ஆகிய நான்கு தகுதிகளை எளிய உதாரணங்களோடு சுவாமிஜி விளக்குகிறார்.',
          notesTa:
            '1. விவேகம் (Viveka): நிலையானதற்கும் நிலையற்றதற்கும் இடையிலான பகுத்தறிவு (குறள் 423).\n2. வைராக்கியம் (Vairagya): மனப் பற்றற்ற சமநிலை (குறள் 34).\n3. ஷட்சம்பத்தி: சமா, தமா, உபரதி, திதிக்ஷா, சிரத்தா, சமாதானம்.\n4. முமுக்ஷுத்வம்: விடுதலையை நாடும் ஆழ்ந்த வேட்கை.',
          notesEn:
            '1. Viveka (Discrimination between enduring truth and transient appearances).\n2. Vairagya (Inner dispassion and emotional balance).\n3. Shatsampatti (Six treasures: calmness, restraint, poise, endurance, faith, focus).\n4. Mumukshutva (Sincere yearning for spiritual freedom).',
          audioUrl: '/api/media/audio/intro-sadhana',
          videoUrl: '/api/media/video/intro-sadhana',
          pptUrl: '/api/media/pdf/ppt-tattva-bodha-intro',
          pdfUrl: '/api/media/pdf/notes-intro-vedanta',
          durationMinutes: 32,
          allowDownload: true,
          featured: true,
        },
        {
          slug: 'gita-ch2-sthithaprajna',
          categorySlug: 'bhagavad-gita',
          chapterTitleEn: 'Chapter 2 · Sankhya Yoga (Verses 54–72)',
          chapterTitleTa: 'அத்தியாயம் 2 · சாங்கிய யோகம் (சுலோகங்கள் 54–72)',
          titleEn: 'Sthithaprajna: Portrait of the Steady-Minded Sage',
          titleTa: 'ஸ்திதப்ரக்ஞன் — சலனமற்ற அறிவாளியின் இலக்கணம்',
          descriptionEn:
            'An illuminating exposition of Arjuna’s question and Sri Krishna’s timeless answer on how a person of steady wisdom speaks, sits, and walks amidst life’s storms.',
          descriptionTa:
            'அர்ஜுனனின் கேள்விக்கு ஸ்ரீ கிருஷ்ணர் அருளிய ஸ்திதப்ரக்ஞனின் அடையாளங்கள் — துன்பத்தில் கலங்காமல், இன்பத்தில் மயங்காமல் வாழும் கலை.',
          notesTa:
            'கீதை 2.55: மனதில் எழும் ஆசைகளைத் துறந்து ஆன்மாவில் நிறைவு காண்பவன் ஸ்திதப்ரக்ஞன்.\nஒப்புமை: திருக்குறள் 4 (வேண்டுதல் வேண்டாமை இலான்).',
          notesEn:
            'Gita 2.55: Abandoning clinging desires of the mind and resting contented in the Self within.\nParallel in Thirukkural 4: Equanimity beyond craving and aversion.',
          audioUrl: '/api/media/audio/gita-sthithaprajna',
          videoUrl: '/api/media/video/gita-sthithaprajna',
          pptUrl: '/api/media/pdf/ppt-gita-ch2',
          pdfUrl: '/api/media/pdf/notes-gita-ch2',
          durationMinutes: 44,
          allowDownload: true,
          featured: true,
        },
        {
          slug: 'gita-ch3-karma-yoga',
          categorySlug: 'bhagavad-gita',
          chapterTitleEn: 'Chapter 3 · Karma Yoga',
          chapterTitleTa: 'அத்தியாயம் 3 · கர்ம யோகம்',
          titleEn: 'Action as Offering: Skillful Duty Without Anxiety',
          titleTa: 'கர்ம யோகம் — பலன் கருதாத் தொண்டே மனத்தூய்மை',
          descriptionEn:
            'Swamiji explains how dedicated action performed as Ishvara Arpana transforms daily work into spiritual discipline.',
          descriptionTa:
            'அன்றாடக் கடமைகளைப் பதற்றமின்றி ஈஸ்வரார்ப்பணமாகச் செய்வதால் மனத்தூய்மை எவ்வாறு மலர்கிறது என்பதை விளக்கும் வகுப்பு.',
          notesTa:
            'கர்ம யோகத்தின் இரு தூண்கள்: ஈஸ்வர அர்ப்பண புத்தி (அர்ப்பணிப்பு) மற்றும் பிரசாத புத்தி (மனநிறைவுடன் ஏற்றல்).',
          notesEn:
            'Two pillars of Karma Yoga: Ishvara Arpana Buddhi (offering action) and Prasada Buddhi (graceful acceptance of results).',
          audioUrl: '/api/media/audio/gita-karma-yoga',
          videoUrl: '/api/media/video/gita-karma-yoga',
          pptUrl: '/api/media/pdf/ppt-gita-ch2',
          pdfUrl: '/api/media/pdf/notes-gita-ch3',
          durationMinutes: 38,
          allowDownload: true,
          featured: false,
        },
        {
          slug: 'isha-upanishad-verse-1',
          categorySlug: 'upanishads',
          chapterTitleEn: 'Isha Upanishad · Mantra 1',
          chapterTitleTa: 'ஈசாவாஸ்ய உபநிஷத் · மந்திரம் 1',
          titleEn: 'Ishavasyam Idam Sarvam — Seeing the Sacred Everywhere',
          titleTa: 'ஈசாவாஸ்யம் இதம் சர்வம் — எங்கும் நிறைந்த இறையுணர்வு',
          descriptionEn:
            'A contemplative class on the opening mantra of Isha Upanishad: renouncing greed and enjoying life as a sacred trust.',
          descriptionTa:
            'அனைத்திலும் இறைவன் உறைகிறான் என்ற உணர்வுடன், பிறர் பொருளுக்கு ஆசைப்படாமல் தியாக உணர்வோடு வாழ்வதன் பெருமை.',
          notesTa:
            'தேந த்யக்தேந புஞ்ஜீதா: பற்றற்ற நிலையோடு அனுபவி. பேராசை நீங்கினால் நிறைவு பிறக்கும்.',
          notesEn:
            'Tena tyaktena bhunjitha: Enjoy the world through inner non-possessiveness; covet no one’s wealth.',
          audioUrl: '/api/media/audio/isha-upanishad',
          videoUrl: '/api/media/video/isha-upanishad',
          pptUrl: '/api/media/pdf/ppt-upanishads',
          pdfUrl: '/api/media/pdf/notes-isha-upanishad',
          durationMinutes: 36,
          allowDownload: true,
          featured: true,
        },
        {
          slug: 'kaivalya-navaneetham-1',
          categorySlug: 'vedantic-texts',
          chapterTitleEn: 'Kaivalya Navaneetham · Part 1 (Tattva Vilakkam)',
          chapterTitleTa: 'கைவல்ய நவநீதம் · பகுதி 1 (தத்துவ விளக்கப் படலம்)',
          titleEn: 'Tamil Vedanta Classic: Essence of Self-Realization',
          titleTa: 'கைவல்ய நவநீதம் — தமிழ் வேதாந்தத்தின் வெண்ணெய்',
          descriptionEn:
            'Thandavaraya Swamigal’s beloved Tamil Vedantic poem taught line-by-line, bridging classical Tamil poetry and Advaita.',
          descriptionTa:
            'தாண்டவராய சுவாமிகள் அருளிய கைவல்ய நவநீதத்தின் முதல் பாடல்களுக்குச் சுவாமிஜியின் தெளிவான தமிழ் உரை.',
          notesTa:
            'பக்தி மற்றும் ஞானம் இரண்டும் முரண்பட்டவை அல்ல; பக்குவப்பட்ட பக்தியே தத்துவ ஞானமாக மலர்கிறது.',
          notesEn:
            'Tamil Vedantic classics weave devotional warmth seamlessly into non-dual inquiry of the Self.',
          audioUrl: '/api/media/audio/kaivalya-navaneetham',
          videoUrl: '/api/media/video/kaivalya-navaneetham',
          pptUrl: '/api/media/pdf/ppt-tattva-bodha-intro',
          pdfUrl: '/api/media/pdf/notes-kaivalya',
          durationMinutes: 41,
          allowDownload: true,
          featured: true,
        },
        {
          slug: 'brahma-sutra-chathussutri',
          categorySlug: 'brahma-sutram',
          chapterTitleEn: 'Adhyaya 1 · Pada 1 · Sutras 1–4',
          chapterTitleTa: 'அத்தியாயம் 1 · பாதம் 1 · சதுஸ்ஸூத்ரி (சூத்திரம் 1–4)',
          titleEn: 'Athato Brahma Jijnasa — The Commencement of Inquiry',
          titleTa: 'அதாதோ ப்ரம்ம ஜிஜ்ஞாஸா — பிரம்ம விசாரணையின் தொடக்கம்',
          descriptionEn:
            'An accessible introduction to the first four foundational sutras of Brahma Sutram and Shankara’s Adhyasa Bhashyam.',
          descriptionTa:
            'சதுஸ்ஸூத்ரி எனப்படும் முதல் நான்கு பிரம்ம சூத்திரங்களின் சாரமும், அத்யாச பாஷ்யத்தின் அடிப்படை விளக்கமும்.',
          notesTa:
            '1. அதாதோ ப்ரம்ம ஜிஜ்ஞாஸா.\n2. ஜன்மாத்யஸ்ய யத:.\n3. சாஸ்த்ர யோநித்வாத்.\n4. தத் து ஸமந்வயாத்.',
          notesEn:
            '1. Now, therefore, the inquiry into Brahman.\n2. That from which origin, sustenance, and dissolution proceed.\n3. Scripture as the valid means of knowledge.\n4. Harmonious synthesis of all Upanishadic texts.',
          audioUrl: '/api/media/audio/brahma-sutra-1',
          videoUrl: '/api/media/video/brahma-sutra-1',
          pptUrl: '/api/media/pdf/ppt-upanishads',
          pdfUrl: '/api/media/pdf/notes-brahma-sutra',
          durationMinutes: 48,
          allowDownload: true,
          featured: false,
        },
        {
          slug: 'kural-and-vedanta-talk',
          categorySlug: 'general-talks',
          chapterTitleEn: 'Special Discourse · Thirukkural & Vedanta',
          chapterTitleTa: 'சிறப்புச் சொற்பொழிவு · திருக்குறளும் வேதாந்தமும்',
          titleEn: 'Manathukkan Maasilan Aadhal: Ethics as the Doorway to Wisdom',
          titleTa: 'மனத்தூய்மையும் மெய்யுணர்வும் — குறளும் வேதாந்தமும்',
          descriptionEn:
            'A widely loved public talk illustrating how Thiruvalluvar’s chapters on Aran, Mei Unardhal, and Avaa Aruththal mirror Upanishadic teaching.',
          descriptionTa:
            'திருக்குறளின் மெய்யுணர்தல், அவா அறுத்தல் அதிகாரங்கள் உபநிஷத் தத்துவத்தோடு எவ்வாறு ஒன்றிணைகின்றன என்பதை விளக்கும் சொற்பொழிவு.',
          notesTa:
            'குறள் 355: எப்பொருள் எத்தன்மைத் தாயினும் அப்பொருள் மெய்ப்பொருள் காண்ப தறிவு.',
          notesEn:
            'True seeing penetrates beyond shifting surface forms to recognize unchanging truth.',
          audioUrl: '/api/media/audio/kural-vedanta-talk',
          videoUrl: '/api/media/video/kural-vedanta-talk',
          pptUrl: '/api/media/pdf/ppt-kural-vedanta',
          pdfUrl: '/api/media/pdf/notes-kural-vedanta',
          durationMinutes: 52,
          allowDownload: true,
          featured: true,
        },
        {
          slug: 'silent-witness-meditation-class',
          categorySlug: 'guided-meditation',
          chapterTitleEn: 'Dhyana Series · Session 1',
          chapterTitleTa: 'தியானத் தொடர் · அமர்வு 1',
          titleEn: 'Sakshi Bhava: Resting as the Silent Witness',
          titleTa: 'சாக்ஷி பாவம் — மௌன சாட்சியாக அமரும் தியானம்',
          descriptionEn:
            'Swamiji guides seekers step-by-step from physical relaxation and breath observation into quiet, effortless awareness.',
          descriptionTa:
            'உடல் தளர்வு, மூச்சுக் கவனிப்பு வழியாகச் சிந்தனைகளின் சாட்சியாக அமரும் அமைதி தியானம்.',
          notesTa:
            'முதுகுத்தண்டு நேராக வைத்து, சுவாசத்தின் இயல்பான ஓட்டத்தைக் கவனிக்கவும். எண்ணங்களை எதிர்க்காமல் சாட்சியாகப் பார்க்கவும்.',
          notesEn:
            'Keep the spine naturally upright, observe the breath without forcing it, and witness thoughts gently as passing clouds.',
          audioUrl: '/api/media/audio/sakshi-meditation',
          videoUrl: '/api/media/video/sakshi-meditation',
          pptUrl: '/api/media/pdf/ppt-meditation-guide',
          pdfUrl: '/api/media/pdf/notes-sakshi-dhyana',
          durationMinutes: 20,
          allowDownload: true,
          featured: true,
        },
      ])
      .onConflictDoNothing();
  }

  const [{ value: pptCount }] = await db.select({ value: count() }).from(presentations);
  if (pptCount === 0) {
    await db
      .insert(presentations)
      .values([
        {
          slug: 'ppt-tattva-bodha-intro',
          titleEn: 'Foundations of Vedanta — Tattva Bodha Visual Deck',
          titleTa: 'வேதாந்த அடிப்படைகள் — தத்துவ போதம் காட்சி விளக்கத் தொகுப்பு',
          topic: 'Vedantic Texts',
          categorySlug: 'vedantic-texts',
          slidesJson: [
            {
              titleTa: '1. வேதாந்தம் — அறிமுகம்',
              titleEn: '1. Introduction to Vedanta',
              bulletsTa: [
                'வேதம் = அறிவு; அந்தம் = முடிவு / சாரம்.',
                'வாழ்வின் நோக்கம்: துன்ப நீக்கமும் நிலைத்த ஆனந்தமும்.',
                'அறம் + சித்த சுத்தி + ஞானம் = முழுமை.',
              ],
              bulletsEn: [
                'Veda means knowledge; Anta means culmination or essence.',
                'Goal of inquiry: Freedom from sorrow and discovery of abiding peace.',
                'Dharma + Purity of Mind + Self-Knowledge = Completeness.',
              ],
              quote: 'மனத்துக்கண் மாசிலன் ஆதல் அனைத்தறன் — குறள் 34',
            },
            {
              titleTa: '2. சாதன சதுஷ்டயம் (நான்கு தகுதிகள்)',
              titleEn: '2. Sadhana Chatushtaya (Four Qualifications)',
              bulletsTa: [
                'விவேகம்: நித்திய அநித்திய வஸ்து விவேகம்.',
                'வைராக்கியம்: பலன் மீதான பற்றின்மை.',
                'ஷட்சம்பத்தி: ஆறு மனப் பண்புகள்.',
                'முமுக்ஷுத்வம்: விடுதலையை நாடும் ஆர்வம்.',
              ],
              bulletsEn: [
                'Viveka: Discernment between the enduring and the transient.',
                'Vairagya: Dispassion toward fleeting sensory outcomes.',
                'Shatsampatti: Sixfold inner discipline (calmness, restraint, poise, forbearance, faith, concentration).',
                'Mumukshutva: Earnest longing for inner freedom.',
              ],
              quote: 'எப்பொருள் யார்யார்வாய்க் கேட்பினும் அப்பொருள் மெய்ப்பொருள் காண்பதறிவு — குறள் 423',
            },
            {
              titleTa: '3. மூன்று சரீரங்கள் & பஞ்ச கோசங்கள்',
              titleEn: '3. Three Bodies & Five Sheaths (Pancha Kosha)',
              bulletsTa: [
                'ஸ்தூல சரீரம் (உடல்) — அன்னமய கோசம்.',
                'சூக்ஷ்ம சரீரம் (பிராணன், மனம், புத்தி) — பிராண, மனோ, விஞ்ஞானமய கோசங்கள்.',
                'காரண சரீரம் — ஆனந்தமய கோசம்.',
                'இவை அனைத்திற்கும் சாட்சியாகத் திகழ்வதே ஆத்மா.',
              ],
              bulletsEn: [
                'Gross Body (Sthula) — Annamaya Kosha (physical sheath).',
                'Subtle Body (Sukshma) — Pranamaya, Manomaya, Vijnanamaya Koshas.',
                'Causal Body (Karana) — Anandamaya Kosha.',
                'The Pure Witnessing Consciousness (Atman) illumines all five sheaths.',
              ],
              quote: 'அகம் பிரம்மாஸ்மி — பிரகதாரண்யக உபநிஷத்',
            },
          ],
          pptFileUrl: '/api/media/pdf/ppt-tattva-bodha-intro',
          pdfFileUrl: '/api/media/pdf/ppt-tattva-bodha-intro',
          allowDownload: true,
          featured: true,
        },
        {
          slug: 'ppt-gita-ch2',
          titleEn: 'Bhagavad Gita Chapter 2 — Essence & Sthithaprajna',
          titleTa: 'பகவத்கீதை 2-ஆம் அத்தியாயம் — ஸ்திதப்ரக்ஞன் விளக்கக் காட்சி',
          topic: 'Bhagavad Gita',
          categorySlug: 'bhagavad-gita',
          slidesJson: [
            {
              titleTa: '1. அர்ஜுனனின் கலக்கமும் சரணாகதியும்',
              titleEn: '1. Arjuna’s Dilemma and Surrender',
              bulletsTa: [
                'அறியாமையாலும் பற்றாலும் எழும் மனக்குழப்பம்.',
                '“சிஷ்யஸ்தேஹம் சாதி மாம் த்வாம் ப்ரபன்னம்” — குருவிடம் பணிவு.',
              ],
              bulletsEn: [
                'Emotional overwhelm born of attachment and confusion.',
                'Turning to a teacher with humility: "I am Your student; instruct me."',
              ],
              quote: 'கற்க கசடறக் கற்பவை — குறள் 391',
            },
            {
              titleTa: '2. கர்ம யோகத்தின் ரகசியம் (கீதை 2.47)',
              titleEn: '2. Secret of Karma Yoga (Gita 2.47)',
              bulletsTa: [
                'செயலில் மட்டுமே நமக்கு உரிமை உண்டு; பலனில் அல்ல.',
                'வெற்றி தோல்வியில் சமநிலை (சமத்வம் யோக உச்யதே).',
              ],
              bulletsEn: [
                'Your right is to dedicated action alone, never to anxiety over outcomes.',
                'Equanimity in success and failure is Yoga.',
              ],
              quote: 'தெய்வத்தான் ஆகா தெனினும் முயற்சிதன் மெய்வருத்தக் கூலி தரும் — குறள் 619',
            },
            {
              titleTa: '3. ஸ்திதப்ரக்ஞனின் மனநிலை',
              titleEn: '3. Mind of the Steady Sage',
              bulletsTa: [
                'ஆமை தன் உறுப்புகளை உள்ளிழுப்பது போல் புலன்களைக் காத்தல்.',
                'நதிகளை ஏத்தும் கடல் போல அமைதியாக இருத்தல்.',
              ],
              bulletsEn: [
                'Withdrawing senses gracefully like a tortoise drawing in its limbs.',
                'Remaining calm and unshaken like the ocean receiving rivers.',
              ],
              quote: 'அடக்கம் அமரருள் உய்க்கும் — குறள் 121',
            },
          ],
          pptFileUrl: '/api/media/pdf/ppt-gita-ch2',
          pdfFileUrl: '/api/media/pdf/ppt-gita-ch2',
          allowDownload: true,
          featured: true,
        },
        {
          slug: 'ppt-kural-vedanta',
          titleEn: 'Thirukkural & Vedanta — Ethical Harmony Slides',
          titleTa: 'திருக்குறளும் வேதாந்தமும் — அறமும் ஞானமும்',
          topic: 'Thirukkural & Philosophy',
          categorySlug: 'general-talks',
          slidesJson: [
            {
              titleTa: '1. திருக்குறளின் முப்பால் அமைப்பு',
              titleEn: '1. Threefold Architecture of Thirukkural',
              bulletsTa: [
                'அறத்துப்பால் (38 அதிகாரம்) — அறவாழ்வும் அகத்தூய்மையும்.',
                'பொருட்பால் (70 அதிகாரம்) — சமுதாயம், கல்வி, அரசாட்சி.',
                'காமத்துப்பால் (25 அதிகாரம்) — தூய அன்பின் இனிமை.',
              ],
              bulletsEn: [
                'Arathuppaal (38 chapters): Virtue and inner purity.',
                'Porutpaal (70 chapters): Polity, learning, friendship, and duty.',
                'Kaamathuppaal (25 chapters): Poetics of love and devotion.',
              ],
              quote: 'அகர முதல எழுத்தெல்லாம் ஆதி பகவன் முதற்றே உலகு — குறள் 1',
            },
            {
              titleTa: '2. வள்ளுவரும் உபநிஷத் சிந்தனையும்',
              titleEn: '2. Valluvar and Upanishadic Insight',
              bulletsTa: [
                'விருப்பு வெறுப்பற்ற நிலை — குறள் 4 & கீதை 2.57.',
                'மெய்யுணர்தல் — அறியாமை நீங்கி உண்மை உணர்தல்.',
              ],
              bulletsEn: [
                'Freedom from desire and aversion — Kural 4 & Gita 2.57.',
                'Meyyunarthal (Truth-Realization) — piercing illusion with wisdom.',
              ],
              quote: 'வேண்டுதல் வேண்டாமை இலானடி சேர்ந்தார்க்கு யாண்டும் இடும்பை இல — குறள் 4',
            },
          ],
          pptFileUrl: '/api/media/pdf/ppt-kural-vedanta',
          pdfFileUrl: '/api/media/pdf/ppt-kural-vedanta',
          allowDownload: true,
          featured: true,
        },
      ])
      .onConflictDoNothing();
  }

  const [{ value: matCount }] = await db.select({ value: count() }).from(studyMaterials);
  if (matCount === 0) {
    await db
      .insert(studyMaterials)
      .values([
        {
          slug: 'thirukkural-student-handbook',
          titleEn: 'Thirukkural Selected 100 Kurals — Bilingual Student Workbook',
          titleTa: 'மாணவர்களுக்கான 100 திருக்குறள் கையேடு (தமிழ் & ஆங்கிலம்)',
          materialType: 'PDF Document',
          language: 'Bilingual',
          categorySlug: 'general-talks',
          summaryEn:
            'Curated bilingual workbook featuring essential couplets on virtue, learning, gratitude, speech, and friendship with reflection prompts.',
          summaryTa:
            'கல்வி, அன்பு, நன்றி, இன்சொல், நட்பு ஆகிய தலைப்புகளில் தேர்ந்தெடுக்கப்பட்ட குறள்களும் பயிற்சி வினாக்களும் அடங்கிய இலவசக் கையேடு.',
          fileUrl: '/api/media/pdf/thirukkural-student-handbook',
          allowDownload: true,
          featured: true,
        },
        {
          slug: 'tattva-bodha-class-notes',
          titleEn: 'Tattva Bodha — Structured Vedanta Class Notes',
          titleTa: 'தத்துவ போதம் — வகுப்புக் குறிப்புகள் & கலைச்சொல் விளக்கம்',
          materialType: 'Class Notes',
          language: 'Tamil',
          categorySlug: 'vedantic-texts',
          summaryEn:
            'Clear Tamil & English glossary of Vedantic terms: Atman, Brahman, Maya, Koshas, and Sadhana Chatushtaya.',
          summaryTa:
            'ஆத்மா, பிரம்மம், மாயை, பஞ்ச கோசங்கள், சாதன சதுஷ்டயம் ஆகிய கலைச்சொற்களின் எளிய விளக்கக் குறிப்புகள்.',
          fileUrl: '/api/media/pdf/tattva-bodha-class-notes',
          allowDownload: true,
          featured: true,
        },
        {
          slug: 'gita-key-verses-guide',
          titleEn: 'Bhagavad Gita — 30 Essential Verses for Daily Contemplation',
          titleTa: 'பகவத்கீதை — அன்றாடச் சிந்தனைக்கான 30 முக்கிய சுலோகங்கள்',
          materialType: 'Reference Book',
          language: 'Bilingual',
          categorySlug: 'bhagavad-gita',
          summaryEn:
            'Printable study booklet containing key verses from Chapters 2, 3, 6, 12, and 18 with Swamiji’s concise takeaways.',
          summaryTa:
            'கீதையின் 2, 3, 6, 12, 18-ஆம் அத்தியாயங்களின் சாரமான சுலோகங்களும் சுவாமிஜியின் சிந்தனைத் துளிகளும்.',
          fileUrl: '/api/media/pdf/gita-key-verses-guide',
          allowDownload: true,
          featured: true,
        },
        {
          slug: 'upanishad-shanti-mantras',
          titleEn: 'Upanishad Shanti Mantras — Meaning & Chanting Guide',
          titleTa: 'உபநிஷத் சாந்தி மந்திரங்கள் — பொருளும் உச்சரிப்பு வழிகாட்டியும்',
          materialType: 'Class Notes',
          language: 'English',
          categorySlug: 'upanishads',
          summaryEn:
            'Complete meaning and contemplation guide for Sahana Vavatu, Purnamadah, and Asato Ma Sadgamaya.',
          summaryTa:
            'ஸஹ நாவவது, பூர்ணமத: பூர்ணமிதம், அஸதோ மா ஸத்கமய மந்திரங்களின் ஆழ்ந்த பொருள் விளக்கம்.',
          fileUrl: '/api/media/pdf/upanishad-shanti-mantras',
          allowDownload: true,
          featured: false,
        },
      ])
      .onConflictDoNothing();
  }

  const [{ value: artCount }] = await db.select({ value: count() }).from(articles);
  if (artCount === 0) {
    await db
      .insert(articles)
      .values([
        {
          slug: 'purity-of-mind-kural-34',
          titleEn: 'Purity of Mind: How Thiruvalluvar Defines Dharma in Seven Words',
          titleTa: 'மனத்தூய்மையே அறம் — குறள் 34 உணர்த்தும் ஆன்மீகப் பேருண்மை',
          excerptEn:
            'Why Kural 34 ("Manaththukkan Maasilan Aadhal") bridges ethical living and the highest Vedantic qualification of Chitta Shuddhi.',
          excerptTa:
            'வெளிப்புறச் சடங்குகளைத் தாண்டி உள்ளத்தின் தூய்மையே அறத்தின் அடிப்படை என்பதைத் திருவள்ளுவர் ஏழு சீர்களில் எவ்வாறு நிறுவுகிறார்.',
          bodyEn:
            'In the fourth chapter of Thirukkural, "Assertion of the Strength of Virtue", Thiruvalluvar offers one of the shortest yet deepest definitions of Dharma ever composed: "Manaththukkan maasilan aadhal anaiththaran; aagula neera pira." (To be free of stain within the mind—that alone is virtue; all else is merely outward show).\n\nIn the Vedantic tradition as well, spiritual transformation begins with Chitta Shuddhi—the cleansing of the inner instrument of thought from jealousy, anger, and selfishness. Without inner purity, rituals and academic pride become "aagula neera" (empty noise). When the mind becomes clear like still temple water, wisdom reflects naturally.\n\nPractical reflection for students and seekers: Before judging an action solely by social applause, pause and ask whether the intention behind it is free from malice and ego.',
          bodyTa:
            'திருக்குறளின் அறன் வலியுறுத்தல் அதிகாரத்தில் வள்ளுவப் பெருந்தகை அறத்திற்குத் தரும் இலக்கணம் உலக இலக்கியங்களில் தனித்துவம் வாய்ந்தது:\n\n"மனத்துக்கண் மாசிலன் ஆதல் அனைத்தறன்\nஆகுல நீர பிற."\n\nஅதாவது, உள்ளத்தில் குற்றம் (அழுக்காறு, அவா, வெகுளி, இன்னாச்சொல்) இல்லாமல் தூய்மையாக இருப்பதே முழுமையான அறம். மற்ற வெளிப்புற ஆடம்பரங்கள் அனைத்தும் ஆரவாரமே தவிர உண்மை அறமல்ல.\n\nவேதாந்த மரபிலும் இதே கருத்தை "சித்த சுத்தி" (Chitta Shuddhi) என்று போற்றுகிறார்கள். கலங்கிய நீரில் நம் முகம் தெளிவாகத் தெரியாதது போல, அழுக்கு நிறைந்த மனதில் ஆன்ம ஞானம் பிரதிபலிக்காது.\n\nநடைமுறைப் பயிற்சி: தினமும் இரவு உறங்கும் முன், இன்று நாம் பேசிய சொற்களிலும் செய்த செயல்களிலும் பிறருக்குத் துன்பம் தராத நல்லெண்ணம் இருந்ததா என ஐந்து நிமிடம் சுயபரிசோதனை செய்வது மனத்தூய்மையை வளர்க்கும்.',
          category: 'Thirukkural',
          author: 'Swamiji Editorial Desk',
          readMinutes: 5,
          featured: true,
        },
        {
          slug: 'karma-yoga-in-modern-life',
          titleEn: 'Karma Yoga in Daily Work: Excellence Without Burnout',
          titleTa: 'அன்றாட வாழ்வில் கர்ம யோகம் — பதற்றமின்றிச் செயல்படும் கலை',
          excerptEn:
            'Transforming study, career, and family responsibilities into serene worship using Bhagavad Gita’s teaching on Samatvam.',
          excerptTa:
            'மாணவர்களும் இல்லறத்தாரும் தங்கள் கடமைகளை மன அழுத்தமின்றி ஆனந்தத்துடன் செய்யப் பகவத்கீதை காட்டும் சமத்துவ வழி.',
          bodyEn:
            'Modern learners often confuse detachment with indifference. Yet Krishna in the Bhagavad Gita defines Yoga as "Yogah Karmasu Kaushalam"—excellence and equanimity in action. When we give 100% effort to our studies or duties while releasing compulsive anxiety over outcomes, work becomes joyful.\n\nPair this with Thiruvalluvar’s insight in Kural 619: earnest effort always yields inner growth and rightful fruit. Together, Gita and Thirukkural inspire fearless diligence anchored in calm trust.',
          bodyTa:
            'பகவத்கீதை கூறும் கர்ம யோகம் என்பது செயலற்று இருப்பதல்ல; செயலை மிகுந்த திறமையோடும் மன அமைதியோடும் செய்வதாகும் ("யோக: கர்மஸு கௌசலம்").\n\nதேர்வு எழுதும் மாணவராக இருந்தாலும், அலுவலகத்தில் பணிபுரிபவராக இருந்தாலும், நமது முழு முயற்சியை நேர்மையோடு செலுத்திவிட்டு, முடிவைப் பற்றிய பயத்தைக் கடவுளிடம் ஒப்படைக்கும்போது மன அழுத்தம் மறைகிறது.\n\nதிருக்குறளும் "முயற்சி தன் மெய்வருத்தக் கூலி தரும்" என ஊக்கப்படுத்துகிறது. உழைப்பில் உறுதியும், முடிவில் சமநிலையும் சேரும்போது வாழ்க்கை இனிமையாகிறது.',
          category: 'Bhagavad Gita',
          author: 'Swamiji',
          readMinutes: 6,
          featured: true,
        },
        {
          slug: 'upanishadic-dialogue-nachi',
          titleEn: 'Lessons from Nachiketa: Courageous Curiosity in Katha Upanishad',
          titleTa: 'நசிகேதனின் கேள்வி — கட உபநிஷத் உணர்த்தும் இளமை ஞானம்',
          excerptEn:
            'What the young seeker Nachiketa teaches students about choosing Shreyas (lasting wisdom) over Preyas (fleeting pleasure).',
          excerptTa:
            'நிலையற்ற இன்பங்களை (பிரேயஸ்) விட நிலையான மேன்மையை (ஸ்ரேயஸ்) தேர்ந்தெடுத்த சிறுவன் நசிகேதனின் கதை.',
          bodyEn:
            'In the Katha Upanishad, young Nachiketa stands before Yama, the Lord of Dharma, and declines kingdoms, gold, and endless sensory pleasures. Instead, he asks for the knowledge of the Self that endures beyond change.\n\nYama praises Nachiketa for distinguishing Shreyas (the enduring good) from Preyas (the immediately pleasant). Every student faces this choice daily: short-term distraction versus deep learning and character.',
          bodyTa:
            'கட உபநிஷத்தில் வரும் இளம் மாணவன் நசிகேதன், எமதர்மனிடம் பொன்னையும் பொருளையும் நீண்ட ஆயுளையும் வேண்டாம் என்று மறுத்து, "ஆன்ம ஞானத்தை மட்டுமே அருளுங்கள்" எனக் கேட்கிறான்.\n\nஎமதர்மன் நசிகேதனைப் பாராட்டி, "ஸ்ரேயஸ்" (நிலையான நன்மை), "பிரேயஸ்" (தற்காலிக இன்பம்) என்ற இரு பாதைகளை விளக்குகிறார். இளைய தலைமுறைக்குத் தெளிவான இலக்கைத் தேர்ந்தெடுக்க இக்கதை என்றும் வழிகாட்டியாகும்.',
          category: 'Upanishads',
          author: 'Tamil Wisdom Research Team',
          readMinutes: 4,
          featured: false,
        },
        {
          slug: 'tamil-bhakti-and-vedanta',
          titleEn: 'Saint Tayumanavar & Tamil Vedanta Heritage',
          titleTa: 'தாயுமானவர் பாடல்களில் சமரச வேதாந்தம்',
          excerptEn:
            'Exploring how Tamil saints harmonized temple devotion with Advaitic stillness in melodic Tamil verse.',
          excerptTa:
            'பக்தியையும் அத்வைத ஞானத்தையும் இனிய தமிழ்ப் பாடல்களில் இணைத்த தாயுமான சுவாமிகளின் அருள்நெறி.',
          bodyEn:
            'Tamil spiritual literature carries a unique fragrance: it never separates philosophical clarity from poetic warmth. Saint Tayumanavar sang "Ellorum inbutrirukka ninaippadhuve allamal verondrariyen Paraaparame"—knowing nothing higher than the joy and welfare of all beings.\n\nThrough accessible Tamil verses, Vedanta entered villages, households, and hearts across Tamil Nadu.',
          bodyTa:
            '"எல்லோரும் இன்புற்றிருக்க நினைப்பதுவே அல்லாமல் வேறொன்றறியேன் பராபரமே" என்ற தாயுமானவரின் திருவாக்கு, தமிழ் வேதாந்தத்தின் கருணை உள்ளத்தைக் காட்டுகிறது.\n\nபக்தியும் ஞானமும் இரு கண்களாகத் திகழும் தமிழ் மெய்ஞ்ஞான மரபு, அனைவருக்கும் சமத்துவத்தையும் அமைதியையும் கற்பிக்கிறது.',
          category: 'Tamil Literature',
          author: 'Dr. Kavitha Sundaram',
          readMinutes: 5,
          featured: true,
        },
      ])
      .onConflictDoNothing();
  }

  const [{ value: quizCount }] = await db.select({ value: count() }).from(quizzes);
  if (quizCount === 0) {
    const insertedQuizzes = await db
      .insert(quizzes)
      .values([
        {
          slug: 'daily-thirukkural-wisdom-quiz',
          titleEn: 'Daily Thirukkural Wisdom Challenge',
          titleTa: 'இன்றைய திருக்குறள் ஞான வினாடி-வினா',
          category: 'Thirukkural',
          difficulty: 'Beginner',
          isDaily: true,
          descriptionEn:
            'Test your understanding of foundational Kurals on virtue, learning, speech, and friendship.',
          descriptionTa:
            'அறம், கல்வி, இன்சொல் மற்றும் நட்பு பற்றிய அடிப்படைத் திருக்குறள்களைப் புரிந்துகொள்ளும் தினசரிப் பயிற்சி.',
        },
        {
          slug: 'bhagavad-gita-karma-sankhya',
          titleEn: 'Bhagavad Gita: Karma & Steady Wisdom Quiz',
          titleTa: 'பகவத்கீதை — கர்ம யோகம் & ஸ்திதப்ரக்ஞன் தேர்வு',
          category: 'Bhagavad Gita',
          difficulty: 'Intermediate',
          isDaily: false,
          descriptionEn:
            'Questions covering Chapter 2 and Chapter 3 concepts taught in Swamiji’s Vedanta classes.',
          descriptionTa:
            'சுவாமிஜியின் கீதை வகுப்புகளின் அடிப்படையில் 2 மற்றும் 3-ஆம் அத்தியாயக் கருத்துக்களுக்கான வினாடி-வினா.',
        },
        {
          slug: 'upanishad-and-vedanta-foundations',
          titleEn: 'Upanishads & Advaita Vedanta Mastery',
          titleTa: 'உபநிஷத் & வேதாந்த தத்துவத் தேர்வு',
          category: 'Vedanta',
          difficulty: 'Advanced',
          isDaily: false,
          descriptionEn:
            'Explore Sadhana Chatushtaya, Pancha Kosha, Isha Upanishad, and Tamil Vedanta classics.',
          descriptionTa:
            'சாதன சதுஷ்டயம், பஞ்ச கோசங்கள், ஈசாவாஸ்ய உபநிஷத் மற்றும் கைவல்ய நவநீதம் குறித்த ஆழ்ந்த வினாக்கள்.',
        },
        {
          slug: 'tamil-spiritual-literature-quiz',
          titleEn: 'Tamil Spiritual Literature & Ethics',
          titleTa: 'தமிழ் ஆன்மீக இலக்கியமும் அறநூல்களும்',
          category: 'Tamil Literature',
          difficulty: 'Beginner',
          isDaily: false,
          descriptionEn:
            'Discover Thiruvalluvar, Tayumanavar, and classical Sangam/post-Sangam ethical wisdom.',
          descriptionTa:
            'திருவள்ளுவர், தாயுமானவர் மற்றும் தமிழ் மெய்ஞ்ஞான நூல்கள் குறித்த சுவாரசியமான கேள்விகள்.',
        },
      ])
      .returning();

    const q1 = insertedQuizzes.find((q) => q.slug === 'daily-thirukkural-wisdom-quiz')!;
    const q2 = insertedQuizzes.find((q) => q.slug === 'bhagavad-gita-karma-sankhya')!;
    const q3 = insertedQuizzes.find((q) => q.slug === 'upanishad-and-vedanta-foundations')!;
    const q4 = insertedQuizzes.find((q) => q.slug === 'tamil-spiritual-literature-quiz')!;

    await db.insert(quizQuestions).values([
      {
        quizId: q1.id,
        questionType: 'mcq',
        promptEn: 'According to Kural 34, what is the true essence of virtue (Aram)?',
        promptTa: 'குறள் 34-இன் படி உண்மையான அறம் என்பது எது?',
        optionsJson: [
          'Performing grand public ceremonies',
          'Having a pure, spotless mind',
          'Accumulating material wealth',
          'Speaking in complex poetry',
        ],
        correctAnswer: 'Having a pure, spotless mind',
        explanationEn: 'Kural 34 states: "Manaththukkan maasilan aadhal anaiththaran" — purity of mind alone is virtue.',
        explanationTa: 'மனத்துக்கண் மாசிலன் ஆதல் அனைத்தறன் — உள்ளத்தில் குற்றமின்றித் தூய்மையாக இருப்பதே அறம்.',
      },
      {
        quizId: q1.id,
        questionType: 'fill_blank',
        promptEn: 'Complete Kural 391: "Karka kasadarak karpavai kattrapin, ______ adharkuth thaga."',
        promptTa: 'குறள் 391-ஐ நிரப்புக: "கற்க கசடறக் கற்பவை கற்றபின் ______ அதற்குத் தக."',
        optionsJson: ['நிற்க (Nirka)', 'செல்க (Selga)', 'சொல்க (Solga)', 'கொள்க (Kolga)'],
        correctAnswer: 'நிற்க (Nirka)',
        explanationEn: '"Nirka adharkuth thaga" means to stand firm and live in accordance with what one has learned.',
        explanationTa: 'கற்ற கல்விக்கு ஏற்றபடி ஒழுக்கத்தில் "நிற்க" வேண்டும் என்பதே இக்குறளின் பொருள்.',
      },
      {
        quizId: q1.id,
        questionType: 'true_false',
        promptEn: 'True or False: In Kural 400, Thiruvalluvar declares learning to be the only imperishable wealth.',
        promptTa: 'சரி / தவறு: குறள் 400-இல் திருவள்ளுவர் கல்வியே அழிவற்ற விழுச்செல்வம் என்கிறார்.',
        optionsJson: ['True', 'False'],
        correctAnswer: 'True',
        explanationEn: 'Kural 400: "Kedil vizhuchchelvam kalvi oruvarkku maadalla mattrai yavai."',
        explanationTa: 'கேடில் விழுச்செல்வம் கல்வி ஒருவருக்கு மாடல்ல மற்றையவை — இது முற்றிலும் சரி.',
      },
      {
        quizId: q1.id,
        questionType: 'mcq',
        promptEn: 'How many total chapters (Adhikarams) and couplets (Kurals) are in the Thirukkural?',
        promptTa: 'திருக்குறளில் மொத்தம் எத்தனை அதிகாரங்களும் குறட்பாக்களும் உள்ளன?',
        optionsJson: [
          '108 chapters and 1,080 couplets',
          '133 chapters and 1,330 couplets',
          '120 chapters and 1,200 couplets',
          '150 chapters and 1,500 couplets',
        ],
        correctAnswer: '133 chapters and 1,330 couplets',
        explanationEn: 'Thirukkural contains 133 chapters with 10 couplets each: 38 in Arathuppaal, 70 in Porutpaal, and 25 in Kaamathuppaal.',
        explanationTa: 'அறத்துப்பால் 38, பொருட்பால் 70, காமத்துப்பால் 25 என மொத்தம் 133 அதிகாரங்களும் 1,330 குறள்களும் உள்ளன.',
      },
      {
        quizId: q2.id,
        questionType: 'mcq',
        promptEn: 'In Bhagavad Gita Chapter 2, what attitude characterizes a Karma Yogi?',
        promptTa: 'பகவத்கீதை 2-ஆம் அத்தியாயத்தில் கர்ம யோகியின் மனநிலை எது?',
        optionsJson: [
          'Avoiding all responsibilities',
          'Equanimity in success and failure (Samatvam)',
          'Working only when praised',
          'Seeking sensory luxury',
        ],
        correctAnswer: 'Equanimity in success and failure (Samatvam)',
        explanationEn: 'Gita 2.48 teaches: "Samatvam yoga uchyate" — evenness of mind is Yoga.',
        explanationTa: '"சமத்வம் யோக உச்யதே" — வெற்றி தோல்விகளைச் சமமாகக் காணும் மனநிலையே யோகம்.',
      },
      {
        quizId: q2.id,
        questionType: 'true_false',
        promptEn: 'True or False: Ishvara Arpana Buddhi means offering every action to the Divine with sincerity.',
        promptTa: 'சரி / தவறு: ஈஸ்வர அர்ப்பண புத்தி என்பது செய்யும் செயல்களை இறைவனுக்கு அர்ப்பணிப்பதாகும்.',
        optionsJson: ['True', 'False'],
        correctAnswer: 'True',
        explanationEn: 'Dedicated action offered selflessly purifies the mind and removes anxiety.',
        explanationTa: 'பலன் எதிர்பாராமல் இறைவனுக்கு அர்ப்பணமாகச் செய்வதே ஈஸ்வர அர்ப்பண புத்தி.',
      },
      {
        quizId: q3.id,
        questionType: 'mcq',
        promptEn: 'Which of the following is the first qualification in Sadhana Chatushtaya?',
        promptTa: 'சாதன சதுஷ்டயத்தில் முதல் தகுதி எது?',
        optionsJson: [
          'Viveka (Discernment)',
          'Krodha (Anger)',
          'Lobha (Greed)',
          'Moha (Delusion)',
        ],
        correctAnswer: 'Viveka (Discernment)',
        explanationEn: 'Viveka is the capacity to discern between the eternal Truth and transient phenomena.',
        explanationTa: 'நித்தியத்திற்கும் அநித்தியத்திற்கும் உள்ள வேறுபாட்டை உணரும் "விவேகம்" முதல் தகுதியாகும்.',
      },
      {
        quizId: q3.id,
        questionType: 'match',
        promptEn: 'Match the Vedantic term "Annamaya Kosha" with its correct layer:',
        promptTa: '"அன்னமய கோசம்" என்பது எந்த உறையினைக் குறிக்கிறது?',
        optionsJson: [
          'Physical sheath nourished by food',
          'Vital breath sheath',
          'Mental & emotional sheath',
          'Bliss sheath',
        ],
        correctAnswer: 'Physical sheath nourished by food',
        explanationEn: 'Annamaya Kosha is the physical body sustained by food (Anna).',
        explanationTa: 'உணவால் (அன்னம்) வளரும் பருவுடல் உறையே அன்னமய கோசம்.',
      },
      {
        quizId: q4.id,
        questionType: 'mcq',
        promptEn: 'Who authored the revered Tamil Vedanta poetic classic "Kaivalya Navaneetham"?',
        promptTa: 'புகழ்பெற்ற தமிழ் வேதாந்த நூலான "கைவல்ய நவநீதம்" இயற்றியவர் யார்?',
        optionsJson: [
          'Thandavaraya Swamigal',
          'Kambar',
          'Ilango Adigal',
          'Nakkirar',
        ],
        correctAnswer: 'Thandavaraya Swamigal',
        explanationEn: 'Thandavaraya Swamigal composed Kaivalya Navaneetham to present Advaita Vedanta in luminous Tamil poetry.',
        explanationTa: 'தாண்டவராய சுவாமிகள் வேதாந்த சாரத்தை வெண்ணெய் போல் திரட்டித் தமிழில் கைவல்ய நவநீதம் இயற்றினார்.',
      },
    ]);
  }

  const [{ value: actCount }] = await db.select({ value: count() }).from(activities);
  if (actCount === 0) {
    await db
      .insert(activities)
      .values([
        {
          type: 'kural_completion',
          titleEn: 'Kural Completion — Complete the Classical Couplet',
          titleTa: 'குறள் நிறைவு — விடுபட்ட சீர்களை நிரப்புக',
          promptEn: 'Select the authentic Tamil word that completes each Thirukkural couplet.',
          promptTa: 'திருக்குறளின் பொருளும் எதுகை மோனையும் பொருந்தும்படி சரியான சொல்லைத் தேர்ந்தெடுக்கவும்.',
          sortOrder: 1,
          dataJson: {
            items: [
              {
                kuralNumber: 1,
                before: 'அகர முதல எழுத்தெல்லாம் ஆதி பகவன்',
                blankLabel: '_____',
                after: 'உலகு.',
                options: ['முதற்றே', 'தலைவன்', 'நிறைந்தே'],
                answer: 'முதற்றே',
                meaningEn: 'The Eternal is first in the world.',
              },
              {
                kuralNumber: 100,
                before: 'இனிய உளவாக இன்னாத கூறல்',
                blankLabel: '_____',
                after: 'கவர்ந்தற்று.',
                options: ['கனியிருப்பக் காய்', 'மலரிருக்கக் காய்', 'பழமிருப்பத் தேன்'],
                answer: 'கனியிருப்பக் காய்',
                meaningEn: 'Like picking unripe fruit when ripe fruit is at hand.',
              },
              {
                kuralNumber: 423,
                before: 'எப்பொருள் யார்யார்வாய்க் கேட்பினும் அப்பொருள்',
                blankLabel: '_____',
                after: 'காண்ப தறிவு.',
                options: ['மெய்ப்பொருள்', 'நற்பொருள்', 'பொய்ப்பொருள்'],
                answer: 'மெய்ப்பொருள்',
                meaningEn: 'Discerning the true essence is wisdom.',
              },
            ],
          },
        },
        {
          type: 'match_meaning',
          titleEn: 'Match the Kural with Its Meaning',
          titleTa: 'குறளையும் அதன் பொருளையும் பொருத்துக',
          promptEn: 'Pair each famous Tamil line with its corresponding ethical insight.',
          promptTa: 'கொடுக்கப்பட்டுள்ள குறள் வரிகளை அவற்றின் சரியான பொருளுடன் இணைக்கவும்.',
          sortOrder: 2,
          dataJson: {
            pairs: [
              {
                id: 'p1',
                left: 'மனத்துக்கண் மாசிலன் ஆதல் (குறள் 34)',
                right: 'Purity of mind alone is true virtue',
              },
              {
                id: 'p2',
                left: 'உடுக்கை இழந்தவன் கைபோல (குறள் 788)',
                right: 'True friendship rushes immediately to relieve distress',
              },
              {
                id: 'p3',
                left: 'தொட்டனைத் தூறும் மணற்கேணி (குறள் 396)',
                right: 'Wisdom grows deeper in proportion to dedicated learning',
              },
              {
                id: 'p4',
                left: 'அகழ்வாரைத் தாங்கும் நிலம்போல (குறள் 151)',
                right: 'Forbearance even toward those who speak ill of us',
              },
            ],
          },
        },
        {
          type: 'vedanta_match',
          titleEn: 'Vedanta Concept Matching',
          titleTa: 'வேதாந்தக் கலைச்சொல் பொருத்தம்',
          promptEn: 'Connect core Sanskrit/Tamil Vedantic concepts with their clear definitions.',
          promptTa: 'வேதாந்த அடிப்படைச் சொற்களை அவற்றின் விளக்கத்துடன் பொருத்தவும்.',
          sortOrder: 3,
          dataJson: {
            pairs: [
              {
                id: 'v1',
                left: 'Viveka (விவேகம்)',
                right: 'Discernment between eternal truth and transient forms',
              },
              {
                id: 'v2',
                left: 'Vairagya (வைராக்கியம்)',
                right: 'Inner freedom from selfish craving and clinging',
              },
              {
                id: 'v3',
                left: 'Sakshi (சாக்ஷி)',
                right: 'The silent witnessing consciousness behind all thoughts',
              },
              {
                id: 'v4',
                left: 'Samatvam (சமத்துவம்)',
                right: 'Equanimity in both success and hardship',
              },
            ],
          },
        },
        {
          type: 'memory',
          titleEn: 'Sacred Wisdom Memory Cards',
          titleTa: 'ஞான நினைவாற்றல் அட்டை விளையாட்டு',
          promptEn: 'Flip two cards at a time to pair Tamil concepts with their English counterparts.',
          promptTa: 'இரண்டு அட்டைகளைத் திருப்பித் தமிழ் மற்றும் ஆங்கில ஞானக் கருத்துக்களை இணைக்கவும்.',
          sortOrder: 4,
          dataJson: {
            pairs: [
              { id: 'm1', a: 'அறம் (Aram)', b: 'Virtue & Righteousness' },
              { id: 'm2', a: 'அன்பு (Anbu)', b: 'Unconditional Love' },
              { id: 'm3', a: 'தியானம் (Dhyana)', b: 'Contemplative Meditation' },
              { id: 'm4', a: 'வாய்மை (Vaaymai)', b: 'Truthfulness' },
              { id: 'm5', a: 'கல்வி (Kalvi)', b: 'Imperishable Learning' },
              { id: 'm6', a: 'மெய்யுணர்தல்', b: 'Realization of Truth' },
            ],
          },
        },
        {
          type: 'reflection',
          titleEn: 'Daily Contemplation & Self-Assessment',
          titleTa: 'தினசரி சிந்தனையும் சுயமதிப்பீடும்',
          promptEn: 'Pause quietly and journal one personal reflection inspired by today’s study.',
          promptTa: 'இன்றைய குறள் மற்றும் வேதாந்தச் சிந்தனையை உங்கள் அன்றாட வாழ்வோடு இணைத்துப் பதிவு செய்யுங்கள்.',
          sortOrder: 5,
          dataJson: {
            prompts: [
              {
                id: 'r1',
                ta: 'இன்று நான் மனத்தூய்மையுடனும் கடுஞ்சொல் தவிர்த்தும் நடந்துகொண்ட தருணம் எது?',
                en: 'When today did I choose gentle words and inner clarity over impatience?',
              },
              {
                id: 'r2',
                ta: 'பலன் மீதான பதற்றத்தை விட்டுவிட்டு என் கடமையை முழு மனதோடு செய்த செயல் எது?',
                en: 'Which duty did I perform sincerely today without worrying about outcomes?',
              },
            ],
          },
        },
      ])
      .onConflictDoNothing();
  }

  const [{ value: medCount }] = await db.select({ value: count() }).from(meditations);
  if (medCount === 0) {
    await db
      .insert(meditations)
      .values([
        {
          slug: 'morning-om-prana-awareness',
          titleEn: 'Morning Breath & Silence (Pranayama + Dhyana)',
          titleTa: 'காலை மூச்சுப் பயிற்சியும் மௌன தியானமும்',
          category: 'Breathing Exercise',
          durationMinutes: 10,
          instructionsTa:
            '1. வசதியான ஆசனத்தில் முதுகு நேராக அமரவும்.\n2. 4 வினாடிகள் மெதுவாக மூச்சை உள்ளிழுக்கவும்.\n3. 4 வினாடிகள் அமைதியாக நிறுத்தவும்.\n4. 6 வினாடிகள் மென்மையாக மூச்சை வெளிவிடவும்.',
          instructionsEn:
            '1. Sit comfortably with spine upright and shoulders relaxed.\n2. Inhale gently through the nose for 4 seconds.\n3. Pause effortlessly for 4 seconds.\n4. Exhale smoothly for 6 seconds while releasing tension.',
          breathingPattern: '4-4-6',
          audioUrl: '/api/media/audio/meditation-morning',
          videoUrl: '/api/media/video/meditation-morning',
          featured: true,
        },
        {
          slug: 'guided-sakshi-meditation',
          titleEn: 'Guided Sakshi Bhava — Witnessing Inner Stillness',
          titleTa: 'வழிகாட்டப்பட்ட சாக்ஷி தியானம் — உள்ளமைதிப் பயணம்',
          category: 'Guided Audio',
          durationMinutes: 15,
          instructionsTa:
            '1. கண்களை மெதுவாக மூடி நெற்றியைத் தளர்த்தவும்.\n2. எண்ணங்கள் தோன்றி மறையும்போது அவற்றின் சாட்சியாக மட்டுமே இருங்கள்.\n3. இதயத் தாமரையில் ஒளிரும் அமைதியை உணருங்கள்.',
          instructionsEn:
            '1. Softly close the eyes and relax the jaw and forehead.\n2. Observe passing thoughts without judging or chasing them.\n3. Rest in the silent awareness that observes every breath.',
          breathingPattern: '4-2-6',
          audioUrl: '/api/media/audio/sakshi-meditation',
          videoUrl: '/api/media/video/sakshi-meditation',
          featured: true,
        },
        {
          slug: 'beginner-shanti-relaxation',
          titleEn: 'Beginner Yoga Nidra & Evening Relaxation',
          titleTa: 'தொடக்க நிலை மாலை நேரத் தளர்வு தியானம்',
          category: 'Beginner Lesson',
          durationMinutes: 12,
          instructionsTa:
            '1. பாதம் முதல் தலை வரை ஒவ்வொரு உறுப்பையும் கவனத்துடன் தளர்த்தவும்.\n2. "ஓம் சாந்தி சாந்தி சாந்தி:" என மனதிற்குள் அமைதியாக உச்சரிக்கவும்.',
          instructionsEn:
            '1. Bring gentle awareness sequentially from toes to crown, releasing physical tightness.\n2. Repeat silently: Om Shanti, Shanti, Shanti.',
          breathingPattern: '5-0-5',
          audioUrl: '/api/media/audio/meditation-shanti',
          videoUrl: '/api/media/video/meditation-shanti',
          featured: false,
        },
      ])
      .onConflictDoNothing();
  }

  const [{ value: settingCount }] = await db.select({ value: count() }).from(siteSettings);
  if (settingCount === 0) {
    await db
      .insert(siteSettings)
      .values([
        {
          key: 'homepage_banner',
          valueJson: {
            headingTa: 'திருக்குறள் & வேதாந்த ஞானம்',
            subheadingEn: 'Discover the Wisdom of Thiruvalluvar and the Timeless Teachings of Vedanta.',
            tamilTagline: 'அறிவைப் பகிர்வோம் – ஞானத்தை வளர்ப்போம்.',
            freeLabelEn: '100% FREE LEARNING – KNOWLEDGE FOR EVERYONE.',
            freeLabelTa: 'கல்வி இலவசம் – ஞானம் அனைவருக்கும்.',
          },
        },
      ])
      .onConflictDoNothing();
  }
}
