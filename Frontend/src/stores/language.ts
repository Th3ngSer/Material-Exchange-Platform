import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

type SupportedLanguage = 'English' | 'Khmer'

type TranslationKey =
  | 'personalInformation'
  | 'trackingItem'
  | 'payments'
  | 'language'
  | 'help'
  | 'logout'
  | 'english'
  | 'khmer'
  | 'languageChanged'
  | 'save'
  | 'firstName'
  | 'lastName'
  | 'birthDate'
  | 'nationality'
  | 'username'
  | 'gender'
  | 'male'
  | 'female'
  | 'phoneNumber'
  | 'email'
  | 'editProfile'
  | 'saveChanges'
  | 'paymentMethod'
  | 'bankTransfer'
  | 'cardPayment'
  | 'transactionOfItem'
  | 'status'
  | 'history'
  | 'pending'
  | 'accepted'
  | 'completed'
  | 'cancelled'
  | 'whyCancel'
  | 'selectReason'
  | 'itemNotAvailable'
  | 'changedMyMind'
  | 'wrongItemSelected'
  | 'other'
  | 'troubleshoot'
  | 'troubleshootDescription'
  | 'workWithSupport'
  | 'supportDescription'
  | 'contactUs'
  | 'successSubmit'
  | 'emailAddress'
  | 'howCanWeHelp'
  | 'whatCanWeProvide'
  | 'submit'
  | 'logoutDescription'
  | 'marketplace'
  | 'categories'
  | 'sortBy'
  | 'xchangeMaterial'
  | 'heroDescription'
  | 'browse'
  | 'learnMore'
  | 'forSale'
  | 'borrow'
  | 'all'
  | 'newest'
  | 'az'
  | 'za'
  | 'posted'
  | 'justNow'
  | 'minutesAgo'
  | 'hoursAgo'
  | 'daysAgo'
  | 'post'
  | 'searchMaterials'
  | 'allTypes'
  | 'loginSignUp'
  | 'footerDescription'
  | 'productItemAlt'
  | 'sellerAlt'
  | 'unknownSeller'
  | 'joinLuminaryNetwork'
  | 'newsletterDescription'
  | 'subscribe'
  | 'company'
  | 'aboutUs'
  | 'career'
  | 'press'
  | 'contact'
  | 'services'
  | 'buy'
  | 'sell'
  | 'exchange'
  | 'lend'
  | 'support'
  | 'helpCenter'
  | 'faq'
  | 'guides'
  | 'legal'
  | 'termsOfService'
  | 'privacyPolicy'
  | 'cookies'
  | 'security'
  | 'globalOffice'
  | 'officeAddress'
  | 'officeCity'
  | 'officeEmail'
  | 'copyright'
  | 'terms'
  | 'privacy'
  | 'supportResource'
  | 'login'
  | 'createAccount'
  | 'password'
  | 'confirmPassword'
  | 'enterYourEmail'
  | 'enterYourPassword'
  | 'confirmYourPassword'
  | 'passwordRequired'
  | 'strength'
  | 'weak'
  | 'medium'
  | 'strong'
  | 'loggingIn'
  | 'creatingAccount'
  | 'dontHaveAccount'
  | 'signUpHere'
  | 'alreadyHaveAccount'
  | 'loginHere'
  | 'letsReleaseProduct'
  | 'search'
  | 'fillDetailsBelow'
  | 'listingType'
  | 'listingInformation'
  | 'productTitle'
  | 'whatIsProductTitle'
  | 'description'
  | 'addDetailsToProduct'
  | 'category'
  | 'select'
  | 'condition'
  | 'new'
  | 'likeNew'
  | 'good'
  | 'fair'
  | 'used'
  | 'price'
  | 'exchangeFor'
  | 'tellWhatWantExchange'
  | 'phone'
  | 'location'
  | 'addAtLeastContact'
  | 'phoneLooksInvalid'
  | 'emailLooksInvalid'
  | 'locationRequired'
  | 'addAtLeastOnePhoto'
  | 'listingDetails'
  | 'reviewPost'
  | 'titleRequired'
  | 'titleMin3Chars'
  | 'descriptionRequired'
  | 'descriptionMin10Chars'
  | 'categoryRequired'
  | 'priceRequiredFor'
  | 'enterValidPrice'
  | 'exchangeForRequired'
  | 'savedListings'
  | 'browseSavedPosts'
  | 'createPost'
  | 'postsSaved'
  | 'postSaved'
  | 'refresh'
  | 'loadingPosts'
  | 'noSavedPostsYet'
  | 'createFirstListing'
  | 'edit'
  | 'delete'
  | 'confirmDelete'
  | 'cannotBeUndone'
  | 'openToTrade'
  | 'wants'
  | 'items'
  | 'users'
  | 'openFilters'
  | 'results'
  | 'reset'
  | 'up'
  | 'closeFiltersBackdrop'
  | 'closeFilters'
  | 'filters'
  | 'priceRange'
  | 'minimumPrice'
  | 'maximumPrice'
  | 'minimumPriceSlider'
  | 'maximumPriceSlider'
  | 'transactionType'
  | 'conditions'
  | 'minimumSellerRating'
  | 'priceLowToHigh'
  | 'priceHighToLow'
  | 'inboxes'
  | 'searchConversations'
  | 'selectConversation'
  | 'secureConnection'
  | 'endToEndEncrypted'
  | 'confirmLogout'
  | 'confirmLogoutMessage'
  | 'cancel'
  | 'materialListings'
  | 'noResultsFound'
  | 'noResultsDescription'
  | 'loadingMoreMaterials'

const translations: Record<SupportedLanguage, Record<TranslationKey, string>> = {
  English: {
    personalInformation: 'Personal Profile',
    trackingItem: 'Tracking Item',
    payments: 'Payments',
    language: 'Language',
    help: 'Help',
    logout: 'Logout',
    english: 'English',
    khmer: 'Khmer',
    languageChanged: 'Language changed to:',
    save: 'Save',
    firstName: 'First Name',
    lastName: 'Last Name',
    birthDate: 'Birth of date',
    nationality: 'Nationality',
    username: 'Username',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    phoneNumber: 'Phone Number',
    email: 'Email',
    editProfile: 'Edit Profile',
    saveChanges: 'Save Changes',
    paymentMethod: 'Payment Method',
    bankTransfer: 'Bank Transfer',
    cardPayment: 'Card Payment',
    transactionOfItem: 'Transaction of Item',
    status: 'Status',
    history: 'History',
    pending: 'Pending',
    accepted: 'Accepted',
    completed: 'Completed',
    cancelled: 'Cancelled',
    whyCancel: 'Why do you want to cancel?',
    selectReason: 'Select a reason',
    itemNotAvailable: 'Item not available',
    changedMyMind: 'Changed my mind',
    wrongItemSelected: 'Wrong item selected',
    other: 'Other',
    troubleshoot: 'Troubleshoot',
    troubleshootDescription: 'Get help with common issues and troubleshoot unexpected behavior.',
    workWithSupport: 'Work with Support',
    supportDescription: 'Submit a bug report, get help collecting log files, and find your system information.',
    contactUs: 'Contact Us',
    successSubmit: 'Thank you for your submit!! We will check as soon as possible.',
    emailAddress: 'Email Address',
    howCanWeHelp: 'How can we help you?',
    whatCanWeProvide: 'What can we provide to you?',
    submit: 'Submit',
    logoutDescription: 'You are about to log out of your account.',
    marketplace: 'Marketplace',
    categories: 'Categories',
    sortBy: 'Sort by',
    xchangeMaterial: 'XChange Material',
    heroDescription: 'A trusted platform for buying, selling, and exchanging everyday items with ease and transparency.',
    browse: 'Browse',
    learnMore: 'Learn more',
    forSale: 'For Sale',
    borrow: 'Borrow',
    all: 'All',
    newest: 'Newest',
    az: 'A-Z',
    za: 'Z-A',
    posted: 'Posted',
    justNow: 'Just now',
    productItemAlt: 'Product item',
    sellerAlt: 'Seller',
    unknownSeller: 'U',
    minutesAgo: 'm ago',
    hoursAgo: 'h ago',
    daysAgo: 'd ago',
    post: 'Post',
    searchMaterials: 'Search materials',
    allTypes: 'All types',
    loginSignUp: 'Login/Sign up',
    footerDescription: 'Empowering the global construction and manufacturing industries through a secure, transparent, and high-performance exchange platform for material reuse.',
    joinLuminaryNetwork: 'Join the Luminary Network',
    newsletterDescription: 'Get weekly updates on material pricing and market trends.',
    subscribe: 'Subscribe',
    company: 'Company',
    aboutUs: 'About Us',
    career: 'Career',
    press: 'Press',
    contact: 'Contact',
    services: 'Services',
    buy: 'Buy',
    sell: 'Sell',
    exchange: 'Exchange',
    lend: 'Lend',
    support: 'Support',
    helpCenter: 'Help center',
    faq: 'FAQ',
    guides: 'Guides',
    legal: 'Legal',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    cookies: 'Cookies',
    security: 'Security',
    globalOffice: 'Global office',
    officeAddress: '18.39 Exchange Road',
    officeCity: 'Singapore, SG 9810',
    officeEmail: 'hello@materialxchange.io',
    copyright: '2026 material xchange',
    terms: 'Terms',
    privacy: 'Privacy',
    supportResource: 'Support & Resource',
    login: 'Login',
    createAccount: 'Create Account',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    enterYourEmail: 'Enter your email',
    enterYourPassword: 'Enter your password',
    confirmYourPassword: 'Confirm your password',
    passwordRequired: 'Password is required',
    strength: 'Strength:',
    weak: 'weak',
    medium: 'medium',
    strong: 'strong',
    loggingIn: 'Logging in...',
    creatingAccount: 'Creating Account...',
    dontHaveAccount: "Don't have an account?",
    signUpHere: 'Sign up here',
    alreadyHaveAccount: 'Already have an account?',
    loginHere: 'Login here',
    letsReleaseProduct: "Let's release your new product",
    search: 'Search',
    fillDetailsBelow: 'Fill in the details below to list your item',
    listingType: 'Listing type',
    listingInformation: 'Listing Information of Product',
    productTitle: 'Product title',
    whatIsProductTitle: 'What is your product title?',
    description: 'Description',
    addDetailsToProduct: 'Add details to your product…',
    category: 'Category',
    select: 'Select…',
    condition: 'Condition',
    new: 'New',
    likeNew: 'Like new',
    good: 'Good',
    fair: 'Fair',
    used: 'Used',
    price: 'Price',
    exchangeFor: 'Exchange for',
    tellWhatWantExchange: 'Tell people what item you want in exchange',
    phone: 'Phone',
    location: 'Location',
    addAtLeastContact: 'Please add at least a phone number or email',
    phoneLooksInvalid: 'Phone number looks invalid',
    emailLooksInvalid: 'Email address looks invalid',
    locationRequired: 'Location is required',
    addAtLeastOnePhoto: 'Please add at least one photo',
    listingDetails: 'Listing details',
    reviewPost: 'Review & post',
    titleRequired: 'Product title is required',
    titleMin3Chars: 'Title must be at least 3 characters',
    descriptionRequired: 'Description is required',
    descriptionMin10Chars: 'Description must be at least 10 characters',
    categoryRequired: 'Category is required',
    priceRequiredFor: 'Price is required for',
    enterValidPrice: 'Please enter a valid price',
    exchangeForRequired: 'Tell people what item you want in exchange',
    savedListings: 'Saved listings',
    browseSavedPosts: 'Browse the posts you already saved',
    createPost: 'Create a post',
    postsSaved: 'posts saved',
    postSaved: 'post saved',
    refresh: 'Refresh',
    loadingPosts: 'Loading posts...',
    noSavedPostsYet: 'No saved posts yet',
    createFirstListing: 'Create the first listing and it will show up here.',
    edit: 'Edit',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete',
    cannotBeUndone: 'This cannot be undone.',
    openToTrade: 'Open to trade',
    wants: 'Wants:',
    items: 'Items',
    users: 'Users',
    openFilters: 'Open filters',
    results: 'Results',
    reset: 'Reset',
    up: 'and up',
    closeFiltersBackdrop: 'Close filters backdrop',
    closeFilters: 'Close filters',
    filters: 'Filters',
    priceRange: 'Price Range',
    minimumPrice: 'Minimum price',
    maximumPrice: 'Maximum price',
    minimumPriceSlider: 'Minimum price slider',
    maximumPriceSlider: 'Maximum price slider',
    transactionType: 'Transaction type',
    conditions: 'Conditions',
    minimumSellerRating: 'Minimum seller rating',
    priceLowToHigh: 'Price: Low to High',
    priceHighToLow: 'Price: High to Low',
    inboxes: 'Inboxes',
    searchConversations: 'Search conversations...',
    selectConversation: 'Select a conversation',
    secureConnection: 'STATUS: SECURE CONNECTION',
    endToEndEncrypted: 'END-TO-END ENCRYPTED',
    confirmLogout: 'Confirm Logout',
    confirmLogoutMessage: 'Are you sure you want to logout?',
    cancel: 'Cancel',
    materialListings: 'Material listings',
    noResultsFound: 'No Results found',
    noResultsDescription: 'We couldn\'t find what you searched for. Try searching again.',
    loadingMoreMaterials: 'Loading more materials...',
  },
  Khmer: {
    personalInformation: 'ព័ត៌មានផ្ទាល់ខ្លួន',
    trackingItem: 'តាមដានទំនិញ',
    payments: 'ការទូទាត់',
    language: 'ភាសា',
    help: 'ជំនួយ',
    logout: 'ចាកចេញ',
    english: 'អង់គ្លេស',
    khmer: 'ខ្មែរ',
    languageChanged: 'ភាសាប្រែទៅ:',
    save: 'រក្សាទុក',
    firstName: 'នាមខ្លួន',
    lastName: 'នាមត្រកូល',
    birthDate: 'ថ្ងៃខែឆ្នាំកំណើត',
    nationality: 'សញ្ជាតិ',
    username: 'ឈ្មោះអ្នកប្រើ',
    gender: 'ភេទ',
    male: 'ប្រុស',
    female: 'ស្រី',
    phoneNumber: 'លេខទូរស័ព្ទ',
    email: 'អ៊ីមែល',
    editProfile: 'កែប្រែព័ត៍មាន',
    saveChanges: 'រក្សាទុកការផ្លាស់ប្តូរ',
    paymentMethod: 'វិធីសាស្ត្រទូទាត់',
    bankTransfer: 'ផ្ទេរទៅធនាគារ',
    cardPayment: 'បង់ប្រាក់តាមកាត',
    transactionOfItem: 'ប្រតិបត្តិការទំនិញ',
    status: 'ស្ថានភាព',
    history: 'ប្រវត្តិស្ថានភាព',
    pending: 'កំពុងរំពឹង',
    accepted: 'បានទទួល',
    completed: 'បានបញ្ចប់',
    cancelled: 'បានបោះបង់',
    whyCancel: 'ហេតុអ្វីដែលអ្នកចង់បោះបង់?',
    selectReason: 'ជ្រើសរើសហេតុផល',
    itemNotAvailable: 'មិនមានទំនិញ',
    changedMyMind: 'ផ្ទេរវិញចិត្ត',
    wrongItemSelected: 'ជ្រើសរើសទំនិញខុស',
    other: 'ផ្សេងទៀត',
    troubleshoot: 'ដោះស្រាយបញ្ហា',
    troubleshootDescription: 'ទទួលជំនួយសម្រាប់បញ្ហាទូទៅ និងដោះស្រាយព្រឹត្តិការណ៍មិនបានរំពឹងទុក។',
    workWithSupport: 'ធ្វើការជាមួយគាំទ្រ',
    supportDescription: 'ដាក់របាយការណ៍ពីកំហុស ទទួលជំនួយក្នុងការប្រមូលឯកសារកំណត់ហេតុ និងរកព័ត៌មានប្រព័ន្ធរបស់អ្នក។',
    contactUs: 'ទំនាក់ទំនងយើងខ្ញុំ',
    successSubmit: 'សូមអរគុណសម្រាប់ការដាក់ស្នើ! យើងនឹងពិនិត្យឆាប់ៗនេះ។',
    emailAddress: 'អាសយដ្ឋានអ៊ីមែល',
    howCanWeHelp: 'តើយើងអាចជួយអ្នកដូចម្តេច?',
    whatCanWeProvide: 'តើយើងអាចផ្តល់អ្វីឲ្យអ្នកបាន?',
    submit: 'ដាក់ស្នើ',
    logoutDescription: 'អ្នកកំពុងត្រូវចាកចេញពីគណនីរបស់អ្នក។',
    marketplace: 'ទីផ្សារ',
    categories: 'ប្រភេទ',
    sortBy: 'តម្រៀបតាម',
    xchangeMaterial: 'XChange សម្ភារៈ',
    heroDescription: 'វេទិកាដែលគួរឱ្យទុកចិត្តសម្រាប់ការទិញ លក់ និងផ្លាស់ប្តូរទំនិញប្រចាំថ្ងៃដោយងាយស្រួល និងថ្លៃសមរម្យ។',
    browse: 'រកមើល',
    learnMore: 'ស្វែងយល់បន្ថែម',
    forSale: 'សម្រាប់លក់',
    borrow: 'ខ្ចី',
    all: 'ទាំងអស់',
    newest: 'ថ្មីជាងគេ',
    az: 'A-Z',
    za: 'Z-A',
    posted: 'បានចុះផ្សាយ',
    justNow: 'ថ្មីៗនេះ',
    productItemAlt: 'ទំនិញផលិតផល',
    sellerAlt: 'អ្នកលក់',
    unknownSeller: 'U',
    minutesAgo: 'នាទីមុន',
    hoursAgo: 'ម៉ោងមុន',
    daysAgo: 'ថ្ងៃមុន',
    post: 'ចុះផ្សាយ',
    searchMaterials: 'ស្វែងរកទំនិញ',
    allTypes: 'ប្រភេទទាំងអស់',
    loginSignUp: 'ចូល/ចុះឈ្មោះ',
    footerDescription: 'ផ្តល់ថាមពលដល់ឧស្សាហកម្មសំណង់ និងឧស្សាហកម្មផលិតកម្មសកល តាមរយៈវេទិកាផ្លាស់ប្តូរទំនិញដែលមានសុវត្ថិភាព ថ្លៃសមរម្យ និងដំណើរការខ្ពស់។',
    joinLuminaryNetwork: 'ចូលរួមបណ្តាញ Luminary',
    newsletterDescription: 'ទទួលបានព័ត៌មានប្រចាំសប្តាហ៍អំពីតម្លៃទំនិញ និងនិន្នាការទីផ្សារ។',
    subscribe: 'ជាវ',
    company: 'ក្រុមហ៊ុន',
    aboutUs: 'អំពីយើង',
    career: 'អាជីព',
    press: 'ព័ត៌មាន',
    contact: 'ទំនាក់ទំនង',
    services: 'សេវាកម្ម',
    buy: 'ទិញ',
    sell: 'លក់',
    exchange: 'ផ្លាស់ប្តូរ',
    lend: 'ខ្ចី',
    support: 'គាំទ្រ',
    helpCenter: 'មជ្ឈមណ្ឌលជំនួយ',
    faq: 'សំណួរគេសួរញឹកញាប់',
    guides: 'មគ្គុទ្ទេសក៍',
    legal: 'ច្បាប់',
    termsOfService: 'ល័ក្ខខ័ណ្ឌសេវាកម្ម',
    privacyPolicy: 'គោលការណ៍ភាពឯកជន',
    cookies: 'ខូគី',
    security: 'សុវត្ថិភាព',
    globalOffice: 'ការិយាល័យសកល',
    officeAddress: '18.39 Exchange Road',
    officeCity: 'Singapore, SG 9810',
    officeEmail: 'hello@materialxchange.io',
    copyright: '2026 material xchange',
    terms: 'ល័ក្ខខ័ណ្ឌ',
    privacy: 'ភាពឯកជន',
    supportResource: 'គាំទ្រ និងធនធាន',
    login: 'ចូល',
    createAccount: 'បង្កើតគណនី',
    password: 'ពាក្យសម្ងាត់',
    confirmPassword: 'បញ្ជាក់ពាក្យសម្ងាត់',
    enterYourEmail: 'បញ្ចូលអ៊ីមែលរបស់អ្នក',
    enterYourPassword: 'បញ្ចូលពាក្យសម្ងាត់របស់អ្នក',
    confirmYourPassword: 'បញ្ជាក់ពាក្យសម្ងាត់របស់អ្នក',
    passwordRequired: 'ពាក្យសម្ងាត់ត្រូវបានទាមទារ',
    strength: 'កម្លាំង:',
    weak: 'ខ្សោយ',
    medium: 'មធ្យម',
    strong: 'ខ្លាំង',
    loggingIn: 'កំពុងចូល...',
    creatingAccount: 'កំពុងបង្កើតគណនី...',
    dontHaveAccount: 'មិនមានគណនីទេ?',
    signUpHere: 'ចុះឈ្មោះនៅទីនេះ',
    alreadyHaveAccount: 'មានគណនីរួចហើយ?',
    loginHere: 'ចូលនៅទីនេះ',
    letsReleaseProduct: 'តោះចេញផលិតផលថ្មីរបស់អ្នក',
    search: 'ស្វែងរក',
    fillDetailsBelow: 'បំពេញព័ត៌មានខាងក្រោមដើម្បីចុះបញ្ជីទំនិញរបស់អ្នក',
    listingType: 'ប្រភេទបញ្ជី',
    listingInformation: 'ព័ត៌មានបញ្ជីនៃផលិតផល',
    productTitle: 'ចំណងជើងផលិតផល',
    whatIsProductTitle: 'តើចំណងជើងផលិតផលរបស់អ្នកជាអ្វី?',
    description: 'ការពិពណ៌នា',
    addDetailsToProduct: 'បន្ថែមព័ត៌មានលម្អិតទៅផលិតផលរបស់អ្នក…',
    category: 'ប្រភេទ',
    select: 'ជ្រើសរើស…',
    condition: 'ស្ថានភាព',
    new: 'ថ្មី',
    likeNew: 'ដូចថ្មី',
    good: 'ល្អ',
    fair: 'ធម្មតា',
    used: 'ប្រើរួច',
    price: 'តម្លៃ',
    exchangeFor: 'ផ្លាស់ប្តូរសម្រាប់',
    tellWhatWantExchange: 'ប្រាប់មនុស្សអំពីទំនិញដែលអ្នកចង់ផ្លាស់ប្តូរ',
    phone: 'ទូរស័ព្ទ',
    location: 'ទីតាំង',
    addAtLeastContact: 'សូមបន្ថែមយ៉ាងហោចណាស់លេខទូរស័ព្ទ ឬអ៊ីមែល',
    phoneLooksInvalid: 'លេខទូរស័ព្ទមើលទៅមិនត្រឹមត្រូវ',
    emailLooksInvalid: 'អាសយដ្ឋានអ៊ីមែលមើលទៅមិនត្រឹមត្រូវ',
    locationRequired: 'ទីតាំងត្រូវបានទាមទារ',
    addAtLeastOnePhoto: 'សូមបន្ថែមយ៉ាងហោចណាស់រូបថតមួយ',
    listingDetails: 'ព័ត៌មានបញ្ជី',
    reviewPost: 'ពិនិត្យ និងចុះផ្សាយ',
    titleRequired: 'ចំណងជើងផលិតផលត្រូវបានទាមទារ',
    titleMin3Chars: 'ចំណងជើងត្រូវមានយ៉ាងហោចណាស់ 3 តួអក្សរ',
    descriptionRequired: 'ការពិពណ៌នាត្រូវបានទាមទារ',
    descriptionMin10Chars: 'ការពិពណ៌នាត្រូវមានយ៉ាងហោចណាស់ 10 តួអក្សរ',
    categoryRequired: 'ប្រភេទត្រូវបានទាមទារ',
    priceRequiredFor: 'តម្លៃត្រូវបានទាមទារសម្រាប់',
    enterValidPrice: 'សូមបញ្ចូលតម្លៃត្រឹមត្រូវ',
    exchangeForRequired: 'ប្រាប់មនុស្សអំពីទំនិញដែលអ្នកចង់ផ្លាស់ប្តូរ',
    savedListings: 'បញ្ជីដែលបានរក្សាទុក',
    browseSavedPosts: 'រកមើលប្រកាសដែលអ្នកបានរក្សាទុករួចហើយ',
    createPost: 'ផុសទំនិញ',
    postsSaved: 'ប្រកាសបានរក្សាទុក',
    postSaved: 'ប្រកាសបានរក្សាទុក',
    refresh: 'ផ្ទុកឡើងវិញ',
    loadingPosts: 'កំពុងផ្ទុកប្រកាស...',
    noSavedPostsYet: 'មិនទាន់មានប្រកាសដែលបានរក្សាទុកនៅឡើយទេ',
    createFirstListing: 'បង្កើតបញ្ជីដំបូង ហើយវានឹងបង្ហាញនៅទីនេះ។',
    edit: 'កែប្រែ',
    delete: 'លុប',
    confirmDelete: 'តើអ្នកប្រាកដថាចង់លុប',
    cannotBeUndone: 'វាមិនអាចត្រឡប់វិញបានទេ។',
    openToTrade: 'បើកចំពោះការជួញដូរ',
    wants: 'ចង់បាន:',
    items: 'ទំនិញ',
    users: 'អ្នកប្រើ',
    openFilters: 'បើកចម្រៀង',
    results: 'លទ្ធផល',
    reset: 'កំណត់ឡើងវិញ',
    up: 'ឡើង',
    closeFiltersBackdrop: 'បិទផ្ទាំងចម្រៀង',
    closeFilters: 'បិទចម្រៀង',
    filters: 'តម្រៀបតាម',
    priceRange: 'លំដាប់តម្លៃ',
    minimumPrice: 'តម្លៃអប្បបរមា',
    maximumPrice: 'តម្លៃអតិបរមា',
    minimumPriceSlider: 'រើសតម្លៃអប្បបរមា',
    maximumPriceSlider: 'រើសតម្លៃអតិបរមា',
    transactionType: 'ប្រភេទប្រតិបត្តិការ',
    conditions: 'លក្ខខណ្ឌ',
    minimumSellerRating: 'ពិន្ទុអ្នកលក់អប្បបរមា',
    priceLowToHigh: 'តម្លៃ៖ ទាបទៅខ្ពស់',
    priceHighToLow: 'តម្លៃ៖ ខ្ពស់ទៅទាប',
    inboxes: 'ប្រអប់ពត៌មាន',
    searchConversations: 'ស្វែងរកស话្ហាបាន...',
    selectConversation: 'ជ្រើសរើសស话្ហាប',
    secureConnection: 'ស្ថានភាព៖ ការតភ្ជាប់ដែលមានសុវត្ថិភាព',
    endToEndEncrypted: 'អ៊ិនគ្រីបពីចុងទៅចុង',
    confirmLogout: 'បញ្ជាក់ការចាកចេញ',
    confirmLogoutMessage: 'តើអ្នកប្រាកដថាចង់ចាកចេញមែនទេ?',
    cancel: 'បោះបង់',
    materialListings: 'បញ្ជីសម្ភារៈ',
    noResultsFound: 'មិនមានលទ្ធផល',
    noResultsDescription: 'យើងមិនអាចស្វែងរកអ្វីដែលអ្នកបានស្វែងរកទេ។ សូមព្យាយាមស្វែងរកម្តងទៀត។',
    loadingMoreMaterials: 'កំពុងផ្ទុកសម្ភារៈបន្ថែម...',
  },
}

export const useLanguageStore = defineStore('language', () => {
  const language = ref<SupportedLanguage>('English')

  const initializeLanguage = () => {
    const saved = localStorage.getItem('language')
    if (saved === 'Khmer' || saved === 'English') {
      language.value = saved
    }
  }

  const setLanguage = (value: SupportedLanguage) => {
    language.value = value
    localStorage.setItem('language', value)
  }

  const t = (key: TranslationKey) => {
    return translations[language.value][key] || key
  }

  const isKhmer = computed(() => language.value === 'Khmer')

  return {
    language,
    initializeLanguage,
    setLanguage,
    t,
    isKhmer,
  }
})
