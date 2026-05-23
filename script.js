/* ===================================================
   Nomina — Advanced Batch File Renamer  (script.js)
   Updated with: Sorting, Recursive, Slice, Ext, Undo
=================================================== */

let currentItems = [];
let selectedItemIndices = new Set();
let windowDragState = null;
let pendingWindowPosition = null;
let windowMoveQueued = false;
let sidebarOpen = false;
let metadataToggle = false;
let appTheme = 'dark';
let appLanguage = 'en';

// متغیرهای سورت
let currentSortCol = 'name';
let currentSortAsc = true;

const I18N = {
    en: {
        appSubtitle: 'Batch File Renamer',
        minimize: 'Minimize',
        maximize: 'Maximize',
        close: 'Close',
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        savePreset: 'Save Preset',
        presetNamePlaceholder: 'Enter preset name...',
        presetHint: 'This will save all your current rules and settings.',
        pathPlaceholder: 'Paste folder path or browse...',
        prefixPlaceholder: 'e.g., [DONE]_ or 2024-',
        suffixPlaceholder: 'e.g., _final or -v2',
        replaceFindPlaceholder: 'Find (or regex pattern)...',
        replaceWithPlaceholder: 'Replace with...',
        removePlaceholder: 'Text to remove...',
        extensionPlaceholder: 'e.g. jpg (without dot)',
        numericPrefixPlaceholder: 'e.g., img_',
        clear: 'Clear',
        pasteLoad: 'Paste & Load',
        browse: 'Browse',
        recursive: 'Recursive',
        includeSubfolders: 'Include Subfolders',
        rules: 'Rules',
        about: 'About',
        presets: 'Presets',
        removeMetadata: 'Remove Metadata',
        switchTheme: 'Switch Theme',
        switchLanguage: 'Switch Language',
        savedConfigs: 'Saved Configs',
        noSavedConfigs: 'No saved configs',
        noSavedPresets: 'No saved presets',
        active: 'Active',
        saveCurrentRules: 'Save Current Rules',
        exportAll: 'Export All',
        importAll: 'Import All',
        exportAllTitle: 'Export all presets as file',
        importAllTitle: 'Import all presets from file',
        renameRules: 'Rename Rules',
        clearAllRules: 'Clear all rules',
        text: 'Text',
        transform: 'Transform',
        number: 'Number',
        dragToReorder: 'Drag to reorder',
        prefix: 'Prefix',
        addPrefix: 'Add Prefix',
        suffix: 'Suffix',
        addSuffix: 'Add Suffix',
        suffixHint: 'Added after name, before extension',
        prefixHint: 'Added after name (Variables: [DATE], [PARENT])',
        replace: 'Replace',
        findReplace: 'Find & Replace',
        remove: 'Remove',
        removeText: 'Remove Text',
        removeHint: 'Removes all occurrences',
        sliceCut: 'Slice (Cut)',
        sliceText: 'Slice Text',
        removeFirst: 'Remove First (chars)',
        removeLast: 'Remove Last (chars)',
        extension: 'Extension',
        changeExtension: 'Change Extension',
        caseTransform: 'Case Transform',
        noChange: 'No Change',
        titleCase: 'Title Case',
        lowercase: 'lowercase',
        uppercase: 'UPPERCASE',
        capitalize: 'Capitalize',
        snake_case: 'snake_case',
        camelCase: 'camelCase',
        kebabCase: 'kebab-case',
        trim: 'Trim Spaces',
        numericSequence: 'Numeric Sequence',
        start: 'Start',
        padding: 'Padding',
        preview: 'Preview',
        applyAll: 'Apply to All',
        filterPlaceholder: 'Filter files...',
        noFolderLoaded: 'No folder loaded',
        emptyDescription: 'Browse to a folder or paste a path above to start renaming files.',
        loadFolder: 'Load a folder',
        applyRules: 'Apply Rules',
        renameAll: 'Rename All',
        rename: 'Rename',
        selectAll: 'Select all',
        name: 'Name',
        ext: 'Ext',
        type: 'Type',
        size: 'Size',
        newName: 'New Name',
        status: 'Status',
        newNamePlaceholder: 'New name...',
        resetNames: 'Reset Names',
        applySelected: 'Apply to Selected',
        undoLast: 'Undo Last',
        files: 'files',
        file: 'file',
        folders: 'folders',
        folder: 'folder',
        total: 'total',
        selected: 'selected',
        lightTheme: 'Light',
        darkTheme: 'Dark',
        languageLabel: 'FA',
        loadPreset: 'Load',
        deletePreset: 'Delete preset',
        exportCurrentRules: 'Export Current Rules',
        importFromFile: 'Import from File',
        exportAllSavedPresets: 'Export All Saved Presets',
        importSavedPresets: 'Import Saved Presets',
        results: 'Results',
        validationWarnings: 'Validation Warnings',
        issue: 'issue',
        issues: 'issues',
        aboutDescription: 'A powerful batch file and folder renamer built for modern workflows. Organize, transform, and rename files with ease.',
        aboutBatchTitle: 'Batch Processing',
        aboutBatchBody: 'Process hundreds of files at once.',
        aboutFilterTitle: 'Smart Filter',
        aboutFilterBody: 'Filter files instantly by name.',
        aboutRulesTitle: 'Rule Engine',
        aboutRulesBody: 'Combine text, transform & numbering.',
        aboutPreviewTitle: 'Live Preview',
        aboutPreviewBody: 'See changes before applying them.',
        developedBy: 'Developed By',
        developerRole: 'Python Developer',
        developerTagline: 'Crafting tools that feel effortless.',
        builtWith: 'Built With',
        press: 'Press',
        toClose: 'to close',
        failedClipboard: 'Failed to read clipboard',
        clipboardEmpty: 'Clipboard is empty',
        enterPath: 'Please enter a folder or file path',
        loadedItems: 'Loaded {count} item{suffix}',
        noItemsFound: 'No items found at this path',
        failedLoad: 'Failed to load: {error}',
        browseFailed: 'Browse failed: {error}',
        allNamesReset: 'All names reset',
        allRulesCleared: 'All rules cleared',
        loadFolderFirst: 'Load a folder first',
        rulesApplied: 'Rules applied to {count} item{suffix}',
        noItemsSelected: 'No items selected',
        rulesAppliedSelected: 'Rules applied to {count} selected item{suffix}',
        conflictsResolved: '{count} name conflict{suffix} auto-resolved',
        folderDropped: 'Loaded dropped folder: {path}',
        noPreviewItems: 'No items have new names to preview',
        previewing: 'Previewing {count} rename{suffix}',
        validate: 'Validate',
        validationHeader: 'Validation results',
        noItemsToValidate: 'No new names to validate',
        allNamesValid: 'All {count} name{suffix} look valid',
        foundIssues: 'Found {count} issue{suffix} — see log below',
        issueInvalidChar: 'Invalid character {char}',
        issueControlChar: 'Contains control character',
        issueReservedName: 'Reserved Windows name',
        issueTrailingDot: 'Ends with space or dot',
        issueLeadingSpace: 'Starts with space',
        issueEmptyName: 'Name is empty',
        issueTooLong: 'Name too long ({len}/255 chars)',
        issueDuplicate: 'Duplicate of another rename in this folder',
        issueCollision: 'Collides with an existing file in this folder',
        undidRename: 'Undid {count} renamed files successfully.',
        failedUndo: 'Failed to undo.',
        undoFailed: 'Undo failed: {error}',
        metadataFailed: 'Metadata removal failed: {error}',
        noRenameItems: 'No items to rename',
        confirmRenameWarnings: 'Confirm Rename (with warnings)',
        confirmRename: 'Confirm Rename',
        continueAnyway: 'Continue anyway?',
        duplicateDetected: 'Duplicate names detected!',
        invalidCharsDetected: 'Invalid characters in some names.',
        tooLongDetected: 'Some names exceed the max length.',
        renameQuestion: 'Rename {count} item{suffix}?',
        renamedSummary: '{success} renamed, {failed} failed',
        renamedSuccess: 'Successfully renamed {count} item(s)!',
        renameFailed: 'Rename failed: {error}',
        presetNameRequired: 'Please enter a preset name',
        presetSaved: 'Preset "{name}" saved!',
        presetLoaded: 'Preset "{name}" loaded!',
        presetDeleted: 'Preset deleted',
        presetExported: 'Preset exported successfully',
        exportFailed: 'Export failed: {error}',
        importFailed: 'Import failed: {error}',
        presetsReplacedOne: 'Replaced all presets with "{name}"',
        presetsReplacedMany: 'Replaced all presets ({count} presets imported)',
        allPresetsExported: 'All presets exported to: {path}',
        presetsImported: 'Imported {count} presets!',
        loadPresetsFailed: 'Failed to load presets: {error}',
        savePresetFailed: 'Failed to save preset: {error}',
        loadPresetFailed: 'Failed to load preset: {error}',
        deletePresetFailed: 'Failed to delete preset: {error}'
        , invalidRegex: 'Invalid regex pattern: {error}'
        , invalidRemoveRegex: 'Invalid regex pattern for Remove: {error}'
    },
    fa: {
        appSubtitle: 'تغییر نام دسته‌ای فایل‌ها',
        minimize: 'کمینه',
        maximize: 'بزرگ‌نمایی',
        close: 'بستن',
        cancel: 'لغو',
        confirm: 'تایید',
        save: 'ذخیره',
        savePreset: 'ذخیره Preset',
        presetNamePlaceholder: 'نام preset را وارد کنید...',
        presetHint: 'همه قانون‌ها و تنظیمات فعلی ذخیره می‌شوند.',
        pathPlaceholder: 'مسیر پوشه را وارد کنید یا انتخاب کنید...',
        prefixPlaceholder: 'مثلا [DONE]_ یا 2024-',
        suffixPlaceholder: 'مثلا _final یا -v2',
        replaceFindPlaceholder: 'متن یا الگوی regex برای یافتن...',
        replaceWithPlaceholder: 'جایگزین شود با...',
        removePlaceholder: 'متن برای حذف...',
        extensionPlaceholder: 'مثلا jpg بدون نقطه',
        numericPrefixPlaceholder: 'مثلا img_',
        clear: 'پاک کردن',
        pasteLoad: 'چسباندن و بارگذاری',
        browse: 'انتخاب',
        recursive: 'زیرپوشه‌ها',
        includeSubfolders: 'شامل زیرپوشه‌ها',
        rules: 'قانون‌ها',
        about: 'درباره',
        presets: 'پیش‌تنظیم‌ها',
        removeMetadata: 'حذف متادیتا',
        switchTheme: 'تغییر تم',
        switchLanguage: 'تغییر زبان',
        savedConfigs: 'تنظیمات ذخیره‌شده',
        noSavedConfigs: 'تنظیمی ذخیره نشده',
        noSavedPresets: 'preset ذخیره نشده',
        active: 'فعال',
        saveCurrentRules: 'ذخیره قانون‌های فعلی',
        exportAll: 'خروجی همه',
        importAll: 'ورود همه',
        exportAllTitle: 'خروجی گرفتن از همه presetها',
        importAllTitle: 'وارد کردن همه presetها از فایل',
        renameRules: 'قانون‌های تغییر نام',
        clearAllRules: 'پاک کردن همه قانون‌ها',
        text: 'متن',
        transform: 'تبدیل',
        number: 'شماره',
        dragToReorder: 'برای جابه‌جایی بکشید',
        prefix: 'پیشوند',
        addPrefix: 'افزودن پیشوند',
        suffix: 'پسوند',
        addSuffix: 'افزودن پسوند',
        suffixHint: 'بعد از نام و قبل از فرمت اضافه می‌شود',
        prefixHint: 'بعد از نام اضافه می‌شود (متغیرها: [DATE], [PARENT])',
        replace: 'جایگزینی',
        findReplace: 'یافتن و جایگزینی',
        remove: 'حذف',
        removeText: 'حذف متن',
        removeHint: 'همه موارد مشابه را حذف می‌کند',
        sliceCut: 'برش متن',
        sliceText: 'برش متن',
        removeFirst: 'حذف از ابتدا (کاراکتر)',
        removeLast: 'حذف از انتها (کاراکتر)',
        extension: 'فرمت',
        changeExtension: 'تغییر فرمت',
        caseTransform: 'تبدیل حروف',
        noChange: 'بدون تغییر',
        titleCase: 'حروف عنوانی',
        lowercase: 'پایین‌حرفی',
        uppercase: 'بالا‌حرفی',
        capitalize: 'اول‌حرفی',
        snake_case: 'snake_case',
        camelCase: 'camelCase',
        kebabCase: 'kebab-case',
        trim: 'حذف فاصله‌ها',
        numericSequence: 'شماره‌گذاری',
        start: 'شروع',
        padding: 'تعداد رقم',
        preview: 'پیش‌نمایش',
        applyAll: 'اعمال روی همه',
        filterPlaceholder: 'فیلتر فایل‌ها...',
        noFolderLoaded: 'پوشه‌ای بارگذاری نشده',
        emptyDescription: 'برای شروع تغییر نام فایل‌ها، یک پوشه انتخاب کنید یا مسیر را وارد کنید.',
        loadFolder: 'بارگذاری پوشه',
        applyRules: 'اعمال قانون‌ها',
        renameAll: 'تغییر نام همه',
        rename: 'تغییر نام',
        selectAll: 'انتخاب همه',
        name: 'نام',
        ext: 'فرمت',
        type: 'نوع',
        size: 'حجم',
        newName: 'نام جدید',
        status: 'وضعیت',
        newNamePlaceholder: 'نام جدید...',
        resetNames: 'بازنشانی نام‌ها',
        applySelected: 'اعمال روی انتخاب‌شده‌ها',
        undoLast: 'برگرداندن آخرین تغییر',
        files: 'فایل',
        file: 'فایل',
        folders: 'پوشه',
        folder: 'پوشه',
        total: 'مجموع',
        selected: 'انتخاب‌شده',
        lightTheme: 'روشن',
        darkTheme: 'تیره',
        languageLabel: 'EN',
        loadPreset: 'بارگذاری',
        deletePreset: 'حذف preset',
        exportCurrentRules: 'خروجی قانون‌های فعلی',
        importFromFile: 'ورود از فایل',
        exportAllSavedPresets: 'خروجی همه presetهای ذخیره‌شده',
        importSavedPresets: 'ورود presetهای ذخیره‌شده',
        results: 'نتیجه‌ها',
        validationWarnings: 'هشدارهای اعتبارسنجی',
        issue: 'مورد',
        issues: 'مورد',
        aboutDescription: 'یک ابزار قدرتمند برای تغییر نام دسته‌ای فایل‌ها و پوشه‌ها. فایل‌ها را راحت‌تر مرتب، تبدیل و نام‌گذاری کنید.',
        aboutBatchTitle: 'پردازش دسته‌ای',
        aboutBatchBody: 'صدها فایل را همزمان پردازش کنید.',
        aboutFilterTitle: 'فیلتر هوشمند',
        aboutFilterBody: 'فایل‌ها را فوری بر اساس نام فیلتر کنید.',
        aboutRulesTitle: 'موتور قانون‌ها',
        aboutRulesBody: 'متن، تبدیل و شماره‌گذاری را ترکیب کنید.',
        aboutPreviewTitle: 'پیش‌نمایش زنده',
        aboutPreviewBody: 'قبل از اعمال، تغییرات را ببینید.',
        developedBy: 'توسعه‌دهنده',
        developerRole: 'توسعه‌دهنده پایتون',
        developerTagline: 'ابزارهایی می‌سازم که ساده و روان به نظر برسند.',
        builtWith: 'ساخته شده با',
        press: 'برای بستن',
        toClose: 'را فشار دهید',
        failedClipboard: 'خواندن clipboard ناموفق بود',
        clipboardEmpty: 'clipboard خالی است',
        enterPath: 'لطفا مسیر فایل یا پوشه را وارد کنید',
        loadedItems: '{count} آیتم بارگذاری شد',
        noItemsFound: 'در این مسیر آیتمی پیدا نشد',
        failedLoad: 'بارگذاری ناموفق بود: {error}',
        browseFailed: 'انتخاب پوشه ناموفق بود: {error}',
        allNamesReset: 'همه نام‌ها بازنشانی شدند',
        allRulesCleared: 'همه قانون‌ها پاک شدند',
        loadFolderFirst: 'اول یک پوشه بارگذاری کنید',
        rulesApplied: 'قانون‌ها روی {count} آیتم اعمال شد',
        noItemsSelected: 'آیتمی انتخاب نشده',
        rulesAppliedSelected: 'قانون‌ها روی {count} آیتم انتخاب‌شده اعمال شد',
        conflictsResolved: '{count} تداخل نام به‌طور خودکار رفع شد',
        folderDropped: 'پوشه‌ی رهاشده بارگذاری شد: {path}',
        noPreviewItems: 'آیتمی با نام جدید برای پیش‌نمایش وجود ندارد',
        previewing: 'پیش‌نمایش {count} تغییر نام',
        validate: 'بررسی صحت',
        validationHeader: 'نتیجه‌ی بررسی نام‌ها',
        noItemsToValidate: 'نام جدیدی برای بررسی وجود ندارد',
        allNamesValid: 'هر {count} نام معتبر هستند',
        foundIssues: '{count} مشکل پیدا شد — جزئیات در پایین',
        issueInvalidChar: 'کاراکتر نامعتبر {char}',
        issueControlChar: 'شامل کاراکتر کنترلی',
        issueReservedName: 'نام رزرو‌شده‌ی ویندوز',
        issueTrailingDot: 'با فاصله یا نقطه تمام می‌شود',
        issueLeadingSpace: 'با فاصله شروع می‌شود',
        issueEmptyName: 'نام خالی است',
        issueTooLong: 'نام بیش از حد طولانی است ({len}/۲۵۵ کاراکتر)',
        issueDuplicate: 'با تغییر‌نام دیگری در این پوشه تکراری است',
        issueCollision: 'با یک فایل موجود در این پوشه تداخل دارد',
        undidRename: '{count} تغییر نام با موفقیت برگردانده شد.',
        failedUndo: 'برگرداندن تغییر ناموفق بود.',
        undoFailed: 'Undo ناموفق بود: {error}',
        metadataFailed: 'حذف متادیتا ناموفق بود: {error}',
        noRenameItems: 'آیتمی برای تغییر نام وجود ندارد',
        confirmRenameWarnings: 'تایید تغییر نام با هشدار',
        confirmRename: 'تایید تغییر نام',
        continueAnyway: 'ادامه می‌دهید؟',
        duplicateDetected: 'نام تکراری پیدا شد!',
        invalidCharsDetected: 'بعضی نام‌ها کاراکتر غیرمجاز دارند.',
        tooLongDetected: 'بعضی نام‌ها از حد مجاز طولانی‌تر هستند.',
        renameQuestion: 'تغییر نام {count} آیتم؟',
        renamedSummary: '{success} تغییر نام موفق، {failed} ناموفق',
        renamedSuccess: '{count} آیتم با موفقیت تغییر نام داده شد!',
        renameFailed: 'تغییر نام ناموفق بود: {error}',
        presetNameRequired: 'لطفا نام preset را وارد کنید',
        presetSaved: 'Preset "{name}" ذخیره شد!',
        presetLoaded: 'Preset "{name}" بارگذاری شد!',
        presetDeleted: 'Preset حذف شد',
        presetExported: 'Preset با موفقیت خروجی گرفته شد',
        exportFailed: 'خروجی گرفتن ناموفق بود: {error}',
        importFailed: 'وارد کردن ناموفق بود: {error}',
        presetsReplacedOne: 'همه presetها با "{name}" جایگزین شدند',
        presetsReplacedMany: 'همه presetها جایگزین شدند ({count} preset وارد شد)',
        allPresetsExported: 'همه presetها در این مسیر خروجی گرفته شدند: {path}',
        presetsImported: '{count} preset وارد شد!',
        loadPresetsFailed: 'بارگذاری presetها ناموفق بود: {error}',
        savePresetFailed: 'ذخیره preset ناموفق بود: {error}',
        loadPresetFailed: 'بارگذاری preset ناموفق بود: {error}',
        deletePresetFailed: 'حذف preset ناموفق بود: {error}'
        , invalidRegex: 'الگوی regex نامعتبر است: {error}'
        , invalidRemoveRegex: 'الگوی regex برای حذف نامعتبر است: {error}'
    }
};

function t(key, vars = {}) {
    const value = I18N[appLanguage]?.[key] || I18N.en[key] || key;
    return Object.keys(vars).reduce((text, name) => text.replaceAll('{' + name + '}', vars[name]), value);
}

function setText(selector, key) {
    const el = document.querySelector(selector);
    if (!el) return;
    const text = t(key);
    const textNode = Array.from(el.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (textNode) {
        textNode.textContent = ' ' + text + ' ';
    } else {
        el.textContent = text;
    }
}

function setTextAll(selector, key) {
    document.querySelectorAll(selector).forEach(el => {
        const textNode = Array.from(el.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
        if (textNode) textNode.textContent = ' ' + t(key) + ' ';
        else el.textContent = t(key);
    });
}

function setAttr(selector, attr, key) {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, t(key));
}

function setAttrAll(selector, attr, key) {
    document.querySelectorAll(selector).forEach(el => el.setAttribute(attr, t(key)));
}

function applyTheme(theme) {
    appTheme = theme === 'light' ? 'light' : 'dark';
    document.body.classList.toggle('theme-light', appTheme === 'light');
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.title = t('switchTheme') + ' (' + t(appTheme === 'light' ? 'lightTheme' : 'darkTheme') + ')';
}

async function toggleTheme() {
    applyTheme(appTheme === 'light' ? 'dark' : 'light');
    await saveAppSetting({ theme: appTheme });
}

function applyLanguage(language) {
    appLanguage = language === 'fa' ? 'fa' : 'en';
    document.documentElement.lang = appLanguage;
    document.body.classList.toggle('lang-fa', appLanguage === 'fa');
    localizeStaticText();
    updateStats();
    updateSelectionInfo();
    updateNumberPreview();
    renderVisibleDynamicUi();
}

async function toggleLanguage() {
    applyLanguage(appLanguage === 'fa' ? 'en' : 'fa');
    await saveAppSetting({ language: appLanguage });
}

async function saveAppSetting(data) {
    try {
        if (window.pywebview?.api) await window.pywebview.api.save_settings(data);
    } catch (e) {
        console.error('Failed to save app setting:', e);
    }
}

// ===== TITLE BAR CONTROLS =====
function minimizeWindow() { if (window.pywebview?.api) window.pywebview.api.minimize(); }
function maximizeWindow() { if (window.pywebview?.api) window.pywebview.api.maximize(); }
function closeWindow()    { if (window.pywebview?.api) window.pywebview.api.close();    }

async function beginWindowDrag(e) {
    if (e.button !== 0 || !window.pywebview?.api) return;
    if (e.target.closest('.titlebar-controls')) return;
    const pos = await window.pywebview.api.get_window_position();
    if (!pos) return;
    windowDragState = { mouseX: e.screenX, mouseY: e.screenY, windowX: pos.x, windowY: pos.y };
}

function queueWindowMove(x, y) {
    pendingWindowPosition = { x, y };
    if (windowMoveQueued || !window.pywebview?.api) return;
    windowMoveQueued = true;
    requestAnimationFrame(async () => {
        const next = pendingWindowPosition;
        pendingWindowPosition = null;
        windowMoveQueued = false;
        if (!next) return;
        try { await window.pywebview.api.move_window(next.x, next.y); } catch {}
    });
}

function handleWindowDrag(e) {
    if (!windowDragState) return;
    queueWindowMove(
        windowDragState.windowX + (e.screenX - windowDragState.mouseX),
        windowDragState.windowY + (e.screenY - windowDragState.mouseY)
    );
}

function endWindowDrag() { windowDragState = null; }

function initCustomTitlebar() {
    const titlebar = document.querySelector('.titlebar');
    if (!titlebar) return;
    titlebar.addEventListener('mousedown', (e) => {
        if (e.detail === 2 && !e.target.closest('.titlebar-controls')) { maximizeWindow(); return; }
        beginWindowDrag(e);
    });
    window.addEventListener('mousemove', handleWindowDrag);
    window.addEventListener('mouseup', endWindowDrag);
    window.addEventListener('blur', endWindowDrag);
}

function updateTitlebarPath(path) {
    const el = document.getElementById('titlebarPath');
    if (!path) { el.innerHTML = ''; return; }
    const parts = path.replace(/\\/g, '/').split('/').filter(Boolean);
    const display = parts.length > 3
        ? '…/' + parts.slice(-3).join('/')
        : parts.join('/');
    el.innerHTML = `
        <div class="titlebar-path-display">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
            <span>${escapeHtml(display)}</span>
        </div>`;
}

// ===== TOAST =====
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    const icons = {
        success: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>',
        error:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
        warning: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
    };
    toast.innerHTML =
        '<span class="toast-icon">' + (icons[type] || icons.info) + '</span>' +
        '<span class="toast-message">' + message + '</span>' +
        '<button class="toast-close" onclick="this.parentElement.remove()">' +
            '<svg width="11" height="11" viewBox="0 0 12 12"><path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
        '</button>';
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastOut .25s ease forwards';
        setTimeout(() => toast.remove(), 260);
    }, duration);
}

// ===== MODAL =====
function showModal(title, body, onConfirm) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').textContent  = body;
    document.getElementById('modalCancelBtn').textContent = t('cancel');
    document.getElementById('modalConfirmBtn').style.display = '';
    document.getElementById('modalOverlay').classList.add('visible');
    document.getElementById('modalConfirmBtn').onclick = () => { closeModal(); if (onConfirm) onConfirm(); };
}
function closeModal() { document.getElementById('modalOverlay').classList.remove('visible'); }

function localizeStaticText() {
    setText('.titlebar-sub', 'appSubtitle');
    setAttr('.titlebar-btn.minimize', 'title', 'minimize');
    setAttr('.titlebar-btn.maximize', 'title', 'maximize');
    setAttr('.titlebar-btn.close', 'title', 'close');
    setText('#modalCancelBtn', 'cancel');
    setText('#modalConfirmBtn', 'confirm');
    setText('#savePresetOverlay .modal-title', 'savePreset');
    setAttr('#presetNameInput', 'placeholder', 'presetNamePlaceholder');
    setText('.preset-name-hint', 'presetHint');
    setText('#savePresetOverlay .modal-footer .btn-ghost', 'cancel');
    setText('#savePresetOverlay .modal-footer .btn-primary', 'save');
    setAttr('.about-close-btn', 'title', 'close');
    setAttr('#pathInput', 'placeholder', 'pathPlaceholder');
    setAttr('#pathClearBtn', 'title', 'clear');
    setText('#loadBtn span', 'pasteLoad');
    setText('#browseBtn span', 'browse');
    setAttr('.recursive-toggle', 'title', 'includeSubfolders');
    setText('.rec-label', 'recursive');
    setText('#rulesToggleBtn > span:not(.rules-badge)', 'rules');
    setAttr('.btn-about', 'title', 'about');
    setAttr('#presetBtn', 'title', 'presets');
    setAttr('#metaToolbarBtn', 'title', 'removeMetadata');
    setAttr('#languageToggleBtn', 'title', 'switchLanguage');
    setText('#languageToggleBtn', 'languageLabel');
    setText('.preset-dropdown-header > span', 'savedConfigs');
    setText('#presetsEmptyDrop', 'noSavedConfigs');
    setText('.preset-save-btn', 'saveCurrentRules');
    setText('.preset-ie-btn:nth-of-type(1)', 'exportAll');
    setText('.preset-ie-btn:nth-of-type(2)', 'importAll');
    setAttr('.preset-ie-btn:nth-of-type(1)', 'title', 'exportAllTitle');
    setAttr('.preset-ie-btn:nth-of-type(2)', 'title', 'importAllTitle');
    setText('.sidebar-title', 'renameRules');
    setAttr('.sidebar-clear-btn', 'title', 'clearAllRules');
    setText('.stab[data-tab="text"]', 'text');
    setText('.stab[data-tab="transform"]', 'transform');
    setText('.stab[data-tab="number"]', 'number');
    setTextAll('.stab-tooltip', 'dragToReorder');
    setAttrAll('.rtoggle-drag', 'title', 'dragToReorder');
    setText('#prefixBtn .rtoggle-label', 'prefix');
    setText('#suffixBtn .rtoggle-label', 'suffix');
    setText('#replaceBtn .rtoggle-label', 'replace');
    setText('#removeBtn .rtoggle-label', 'remove');
    setText('#sliceBtn .rtoggle-label', 'sliceCut');
    setText('#extensionBtn .rtoggle-label', 'extension');
    const prefixLabel = document.querySelector('#prefixRule .rfield-label');
    if (prefixLabel) prefixLabel.lastChild.textContent = t('addPrefix');
    const suffixLabel = document.querySelector('#suffixRule .rfield-label');
    if (suffixLabel) suffixLabel.lastChild.textContent = t('addSuffix');
    setText('#suffixRule .rfield-hint', 'suffixHint');
    setText('#prefixRule .rfield-hint', 'prefixHint');
    const replaceLabel = document.querySelector('#replaceRule .rfield-label');
    if (replaceLabel) replaceLabel.lastChild.textContent = t('findReplace');
    const removeLabel = document.querySelector('#removeRule .rfield-label');
    if (removeLabel) removeLabel.lastChild.textContent = t('removeText');
    setText('#removeRule .rfield-hint', 'removeHint');
    const sliceLabel = document.querySelector('#sliceRule .rfield-label');
    if (sliceLabel) sliceLabel.lastChild.textContent = t('sliceText');
    const sliceLabels = document.querySelectorAll('#sliceRule .num-field label');
    if (sliceLabels[0]) sliceLabels[0].textContent = t('removeFirst');
    if (sliceLabels[1]) sliceLabels[1].textContent = t('removeLast');
    const extLabel = document.querySelector('#extensionRule .rfield-label');
    if (extLabel) extLabel.lastChild.textContent = t('changeExtension');
    setText('#transformTab .rule-group-label', 'caseTransform');
setText('#transform-none .topt-label', 'noChange');
    setText('#transform-lowercase .topt-label', 'lowercase');
    setText('#transform-uppercase .topt-label', 'uppercase');
    setText('#transform-capitalize .topt-label', 'capitalize');
    setText('#transform-snake_case .topt-label', 'snake_case');
    setText('#transform-camelCase .topt-label', 'camelCase');
    setText('#transform-kebab-case .topt-label', 'kebabCase');
    setText('#transform-trim .topt-label', 'trim');
    setText('#numberTab .rule-group-label', 'numericSequence');
    const numberLabels = document.querySelectorAll('#numberTab .num-field label');
    if (numberLabels[0]) numberLabels[0].textContent = t('start');
    if (numberLabels[1]) numberLabels[1].textContent = t('padding');
    if (numberLabels[2]) numberLabels[2].textContent = t('prefix');
    setText('.num-preview-label', 'preview');
    setText('.sidebar-footer .btn-apply', 'applyAll');
    setAttr('#filterInput', 'placeholder', 'filterPlaceholder');
    setText('.empty-title', 'noFolderLoaded');
    setText('.empty-desc', 'emptyDescription');
    const steps = document.querySelectorAll('.estep span');
    if (steps[0]) steps[0].textContent = t('loadFolder');
    if (steps[1]) steps[1].textContent = t('applyRules');
    if (steps[2]) steps[2].textContent = t('renameAll');
    const emptyKeys = document.querySelector('.empty-keys');
    if (emptyKeys) emptyKeys.innerHTML = '<kbd>Ctrl+Enter</kbd> ' + t('loadFolder') + ' &nbsp;·&nbsp; <kbd>Ctrl+Shift+V</kbd> ' + t('pasteLoad') + ' &nbsp;·&nbsp; <kbd>Ctrl+S</kbd> ' + t('rename');
    setAttr('.check-all', 'title', 'selectAll');
    const headers = document.querySelectorAll('.file-table th .th-inner');
    if (headers[0]) headers[0].firstChild.textContent = t('name') + ' ';
    if (headers[1]) headers[1].firstChild.textContent = t('ext') + ' ';
    if (headers[2]) headers[2].firstChild.textContent = t('type') + ' ';
    if (headers[3]) headers[3].firstChild.textContent = t('size') + ' ';
    if (headers[4]) headers[4].textContent = t('newName');
    if (headers[5]) headers[5].textContent = t('status');
    setText('.action-bar-left .btn-ghost:not(#applySelectedBtn)', 'resetNames');
    setText('#applySelectedBtn', 'applySelected');
    setText('#validateBtn', 'validate');
    setText('#renameBtn', 'renameAll');
    setText('#undoBtn', 'undoLast');
    setAttr('#prefixInput', 'placeholder', 'prefixPlaceholder');
    setAttr('#suffixInput', 'placeholder', 'suffixPlaceholder');
    setAttr('#replaceFind', 'placeholder', 'replaceFindPlaceholder');
    setAttr('#replaceWith', 'placeholder', 'replaceWithPlaceholder');
    setAttr('#removeText', 'placeholder', 'removePlaceholder');
    setAttr('#extensionInput', 'placeholder', 'extensionPlaceholder');
    setAttr('#numericPrefix', 'placeholder', 'numericPrefixPlaceholder');
    applyTheme(appTheme);
}

function renderVisibleDynamicUi() {
    document.querySelectorAll('.new-name-input').forEach(input => input.placeholder = t('newNamePlaceholder'));
    const fileTableWrap = document.getElementById('fileTableWrap');
    if (currentItems.length > 0 && fileTableWrap && fileTableWrap.style.display !== 'none') renderFileList();
    if (window.pywebview?.api) updatePresetDropdownList();
}

// ===== SIDEBAR =====
function openSidebar() {
    sidebarOpen = true;
    document.getElementById('rulesSidebar').classList.add('open');
    document.getElementById('rulesToggleBtn').classList.add('sidebar-open');
}
function closeSidebar() {
    sidebarOpen = false;
    document.getElementById('rulesSidebar').classList.remove('open');
    document.getElementById('rulesToggleBtn').classList.remove('sidebar-open');
}
function toggleSidebar() {
    if (sidebarOpen) closeSidebar(); else openSidebar();
}

// ===== PATH INPUT helper =====
function clearPathInput() {
    document.getElementById('pathInput').value = '';
    document.getElementById('pathClearBtn').style.display = 'none';
    updateTitlebarPath('');
    hideFileList();
}

document.getElementById('pathInput').addEventListener('input', function() {
    document.getElementById('pathClearBtn').style.display = this.value ? '' : 'none';
});

// ===== DRAG & DROP =====
// The actual absolute-path delivery happens on the Python side (main.py: _on_drop),
// which calls window.handleDroppedPath. This JS only manages preventDefault + UI.
let _dragDepth = 0;
function _isFileDrag(e) {
    if (!e.dataTransfer) return false;
    const types = e.dataTransfer.types;
    if (!types) return false;
    for (let i = 0; i < types.length; i++) if (types[i] === 'Files') return true;
    return false;
}
function setupDragAndDrop() {
    window.addEventListener('dragenter', (e) => {
        if (!_isFileDrag(e)) return;
        e.preventDefault();
        _dragDepth++;
        document.body.classList.add('drag-active');
    });
    window.addEventListener('dragover', (e) => {
        if (!_isFileDrag(e)) return;
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    });
    window.addEventListener('dragleave', (e) => {
        if (!_isFileDrag(e)) return;
        _dragDepth = Math.max(0, _dragDepth - 1);
        if (_dragDepth === 0) document.body.classList.remove('drag-active');
    });
    window.addEventListener('drop', (e) => {
        if (!_isFileDrag(e)) return;
        e.preventDefault();
        _dragDepth = 0;
        document.body.classList.remove('drag-active');
    });
}
function _commonParent(paths) {
    if (!paths || paths.length === 0) return '';
    if (paths.length === 1) {
        const p = paths[0].replace(/\\/g, '/');
        const idx = p.lastIndexOf('/');
        return idx > 0 ? paths[0].substring(0, idx) : paths[0];
    }
    const norm = paths.map(p => p.replace(/\\/g, '/').split('/'));
    let i = 0;
    outer: while (true) {
        const candidate = norm[0][i];
        if (candidate === undefined) break;
        for (let j = 1; j < norm.length; j++) {
            if (norm[j][i] !== candidate) break outer;
        }
        i++;
    }
    if (i === 0) return paths[0];
    const useBack = paths[0].indexOf('\\') !== -1;
    return norm[0].slice(0, i).join(useBack ? '\\' : '/');
}

window.handleDroppedPaths = async function(paths) {
    _dragDepth = 0;
    document.body.classList.remove('drag-active');
    if (!paths || paths.length === 0) return;

    const displayPath = _commonParent(paths);
    const input = document.getElementById('pathInput');
    if (input) input.value = displayPath;
    const clearBtn = document.getElementById('pathClearBtn');
    if (clearBtn) clearBtn.style.display = displayPath ? '' : 'none';

    const isRecursive = document.getElementById('recursiveChk')?.checked || false;
    const loadBtn = document.getElementById('loadBtn');
    setLoading(loadBtn, true);

    try {
        const result = await window.pywebview.api.get_items_from_paths(paths, isRecursive);
        if (result.error) {
            showToast(result.error, 'error');
            hideFileList();
        } else if (result.items && result.items.length > 0) {
            currentItems = result.items;
            sortItemsArray(currentSortCol, currentSortAsc);
            selectedItemIndices.clear();
            currentItems.forEach((_, i) => selectedItemIndices.add(i));
            renderFileList(); updateStats(); showFileList(); updateTitlebarPath(displayPath); openSidebar();
            const undoBtn = document.getElementById('undoBtn');
            if (undoBtn) undoBtn.style.display = 'none';
            showToast(t('folderDropped', { path: displayPath }), 'success');
        } else {
            showToast(t('noItemsFound'), 'warning');
            hideFileList();
        }
    } catch (err) {
        showToast(t('failedLoad', { error: (err && err.message) || err }), 'error');
        hideFileList();
    } finally {
        setLoading(loadBtn, false);
    }
};
// Back-compat for any older Python builds still calling the singular name
window.handleDroppedPath = function(path) { window.handleDroppedPaths([path]); };
document.addEventListener('DOMContentLoaded', setupDragAndDrop);

// ===== PASTE & LOAD =====
async function pasteAndLoad() {
    const pathInput = document.getElementById('pathInput');
    let clipboardText = '';
    try { clipboardText = await window.pywebview.api.get_clipboard_text(); }
    catch { showToast(t('failedClipboard'), 'warning'); pathInput.focus(); return; }
    const pastedPath = clipboardText.trim();
    if (!pastedPath) { showToast(t('clipboardEmpty'), 'warning'); return; }
    pathInput.value = pastedPath;
    document.getElementById('pathClearBtn').style.display = '';
    await loadPath();
}

// ===== LOAD PATH =====
async function loadPath(isRefresh = false) {
    const pathInput = document.getElementById('pathInput');
    const path = pathInput.value.trim();
    if (!path) { showToast(t('enterPath'), 'warning'); return; }

    const isRecursive = document.getElementById('recursiveChk')?.checked || false;
    const loadBtn = document.getElementById('loadBtn');
    setLoading(loadBtn, true);

    try {
        const result = await window.pywebview.api.get_items(path, isRecursive);
        if (result.error) {
            showToast(result.error, 'error');
            hideFileList();
        } else if (result.items && result.items.length > 0) {
            currentItems = result.items;
            sortItemsArray(currentSortCol, currentSortAsc);
            selectedItemIndices.clear();
            currentItems.forEach((_, i) => selectedItemIndices.add(i));
            
            renderFileList(); updateStats(); showFileList(); updateTitlebarPath(path); openSidebar();
            
            // فقط اگر پوشه جدیدی لود شده بود دکمه Undo رو مخفی کن
            if (!isRefresh) {
                const undoBtn = document.getElementById('undoBtn');
                if(undoBtn) undoBtn.style.display = 'none';
            }
            
            if (!isRefresh) showToast(t('loadedItems', { count: currentItems.length, suffix: currentItems.length !== 1 ? 's' : '' }), 'success');
        } else {
            showToast(t('noItemsFound'), 'warning');
            hideFileList(); updateTitlebarPath('');
        }
    } catch (err) {
        showToast(t('failedLoad', { error: err.message || err }), 'error');
        hideFileList();
    } finally {
        setLoading(loadBtn, false);
    }
}

async function browseFolder() {
    try {
        const settings = await window.pywebview.api.get_settings();
        const lastFolderPath = (settings && settings.lastFolderPath) || null;
        const path = await window.pywebview.api.browse_folder(lastFolderPath);
        if (path) {
            document.getElementById('pathInput').value = path;
            document.getElementById('pathClearBtn').style.display = '';
            await loadPath();
        }
    } catch (err) {
        showToast(t('browseFailed', { error: err.message || err }), 'error');
    }
}

// ===== SORTING =====
// Natural / alphanumeric collator — numeric runs in a name are compared as
// numbers (so `img2` < `img10`), and locale + case rules are handled correctly.
// One instance is reused for performance — building a Collator per compare is slow.
const _naturalCollator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base',
    caseFirst: 'lower',
    usage: 'sort',
});

// Split "imageye_1_10-l2oFOaQFl0.jpg" → ["imageye_1_10-l2oFOaQFl0", ".jpg"]
// so the extension only acts as a final tie-breaker. Hidden files like
// ".gitignore" are treated as having no extension.
function _splitNameExt(name) {
    if (!name) return ['', ''];
    const lastDot = name.lastIndexOf('.');
    if (lastDot <= 0 || lastDot === name.length - 1) return [name, ''];
    return [name.substring(0, lastDot), name.substring(lastDot)];
}

function naturalCompareName(a, b) {
    if (a === b) return 0;
    const [aBase, aExt] = _splitNameExt(a);
    const [bBase, bExt] = _splitNameExt(b);
    const baseCmp = _naturalCollator.compare(aBase, bBase);
    if (baseCmp !== 0) return baseCmp;
    return _naturalCollator.compare(aExt, bExt);
}

function sortTable(column) {
    if (currentSortCol === column) {
        currentSortAsc = !currentSortAsc;
    } else {
        currentSortCol = column;
        currentSortAsc = true;
    }

    document.querySelectorAll('th.sortable').forEach(th => th.classList.remove('asc', 'desc'));
    const th = document.querySelector(`.col-${column}`);
    if(th) th.classList.add(currentSortAsc ? 'asc' : 'desc');

    sortItemsArray(currentSortCol, currentSortAsc);

    // رفرش کردن انتخاب‌ها بعد از سورت
    selectedItemIndices.clear();
    currentItems.forEach((_, i) => selectedItemIndices.add(i));

    renderFileList();
}

function sortItemsArray(col, asc) {
    const dir = asc ? 1 : -1;
    currentItems.sort((a, b) => {
        let cmp = 0;

        if (col === 'size') {
            cmp = (a.size || 0) - (b.size || 0);
            if (cmp === 0) cmp = naturalCompareName(a.name || '', b.name || '');
        } else if (col === 'extension') {
            cmp = _naturalCollator.compare(a.extension || '', b.extension || '');
            if (cmp === 0) cmp = naturalCompareName(a.name || '', b.name || '');
        } else if (col === 'type') {
            cmp = _naturalCollator.compare(a.type || '', b.type || '');
            if (cmp === 0) cmp = naturalCompareName(a.name || '', b.name || '');
        } else {
            cmp = naturalCompareName(a[col] || '', b[col] || '');
        }

        return cmp * dir;
    });
}

// ===== RENDER =====
function renderFileList() {
    const tbody = document.getElementById('fileListBody');
    tbody.innerHTML = '';
    currentItems.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.dataset.index = index;
        if (selectedItemIndices.has(index)) tr.classList.add('selected');

        const ext      = item.extension ? item.extension.replace('.', '') : '—';
        const size     = item.type === 'file' ? formatSize(item.size) : '—';
        const iconSvg  = item.type === 'folder' ? getFolderSVG() : getFileSVG(item.extension);
        const isChecked = selectedItemIndices.has(index) ? 'checked' : '';

        tr.innerHTML =
            '<td><label class="row-check" onclick="event.stopPropagation()">' +
                '<input type="checkbox" data-chk="' + index + '" ' + isChecked +
                    ' onchange="handleRowCheck(' + index + ', this.checked)"/>' +
                '<span class="chk-box"></span>' +
            '</label></td>' +
            '<td><div class="fname-cell">' +
                '<div class="ficon ' + item.type + '">' + iconSvg + '</div>' +
                '<span class="fname-text" title="' + escapeHtml(item.name) + '">' + escapeHtml(item.name) + '</span>' +
            '</div></td>' +
            '<td><span class="ext-badge">' + escapeHtml(ext) + '</span></td>' +
            '<td><span class="type-tag ' + item.type + '">' + t(item.type === 'folder' ? 'folder' : 'file') + '</span></td>' +
            '<td><span class="size-text">' + size + '</span></td>' +
            '<td><input type="text" class="new-name-input" data-index="' + index + '" placeholder="' + escapeHtml(t('newNamePlaceholder')) + '" value="" oninput="onNewNameInput(this)"/></td>' +
            '<td><div class="status-cell"><div class="status-dot pending"></div></div></td>';

        tr.addEventListener('click', (e) => {
            if (e.target.closest('input')) return;
            toggleItemSelection(index);
        });

        tbody.appendChild(tr);
    });

    applyFilter();
    updateSelectAllCheckbox();
}

function getFolderSVG() { return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>'; }
function getFileSVG(ext) {
    const e = (ext || '').toLowerCase().replace('.', '');
    const colorMap = {
        jpg:'#3ecf8e', jpeg:'#3ecf8e', png:'#3ecf8e', gif:'#3ecf8e', webp:'#3ecf8e', svg:'#3ecf8e',
        mp4:'#f16161', mov:'#f16161', avi:'#f16161', mkv:'#f16161',
        mp3:'#f5a623', wav:'#f5a623', flac:'#f5a623', aac:'#f5a623',
        pdf:'#f16161',
        zip:'#b06af5', rar:'#b06af5', '7z':'#b06af5', tar:'#b06af5',
        js:'#f5a623', ts:'#5b9cf6', py:'#3ecf8e', html:'#f16161', css:'#5b9cf6', json:'#f5a623',
        txt:'#a8a5bf', md:'#a8a5bf', log:'#6b6888',
        xls:'#3ecf8e', xlsx:'#3ecf8e', csv:'#3ecf8e', doc:'#5b9cf6', docx:'#5b9cf6', ppt:'#f5a623', pptx:'#f5a623',
    };
    const color = colorMap[e] || '#7c6dfa';
    return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
}

function onNewNameInput(input) {
    const index = parseInt(input.dataset.index);
    const item  = currentItems[index];
    if (!item) return;
    const hasChange = input.value !== '' && input.value !== item.name;
    input.classList.toggle('changed', hasChange);
    // Any prior validation result is stale once the name changes — clear it.
    const dot = input.closest('tr')?.querySelector('.status-dot');
    if (dot && (dot.classList.contains('error') || dot.classList.contains('success'))) {
        dot.className = 'status-dot pending';
    }
}

function formatSize(bytes) {
    if (bytes === 0) return '0B';
    const units = ['B','KB','MB','GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + units[i];
}

function escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

// ===== STATS =====
function updateStats() {
    const files   = currentItems.filter(i => i.type === 'file').length;
    const folders = currentItems.filter(i => i.type === 'folder').length;
    
    document.getElementById('filesCount').lastChild.textContent   = ' ' + files + ' ' + t(files === 1 ? 'file' : 'files');
    document.getElementById('foldersCount').lastChild.textContent = ' ' + folders + ' ' + t(folders === 1 ? 'folder' : 'folders');
    document.getElementById('totalCount').lastChild.textContent   = ' ' + currentItems.length + ' ' + t('total');
    
    updateSelectionInfo();
}

// ===== SELECTION =====
function handleRowCheck(index, checked) {
    if (checked) selectedItemIndices.add(index);
    else         selectedItemIndices.delete(index);
    const tr = document.querySelector('tr[data-index="' + index + '"]');
    if (tr) tr.classList.toggle('selected', checked);
    updateSelectionInfo();
    updateSelectAllCheckbox();
    updateApplySelectedBtn();
}

function handleSelectAll(chk) {
    currentItems.forEach((_, i) => {
        if (chk.checked) selectedItemIndices.add(i);
        else             selectedItemIndices.delete(i);
    });
    document.querySelectorAll('[data-chk]').forEach(c => {
        c.checked = chk.checked;
        const tr = c.closest('tr');
        if (tr) tr.classList.toggle('selected', chk.checked);
    });
    updateSelectionInfo();
    updateApplySelectedBtn();
}

function toggleItemSelection(index) {
    const has = selectedItemIndices.has(index);
    if (has) selectedItemIndices.delete(index);
    else     selectedItemIndices.add(index);
    const tr = document.querySelector('tr[data-index="' + index + '"]');
    if (tr) {
        tr.classList.toggle('selected', !has);
        const chk = tr.querySelector('[data-chk]');
        if (chk) chk.checked = !has;
    }
    updateSelectionInfo();
    updateSelectAllCheckbox();
    updateApplySelectedBtn();
}

function updateSelectAllCheckbox() {
    const chk = document.getElementById('selectAllChk');
    if (!chk) return;
    const visibleRows = Array.from(document.querySelectorAll('.file-table tbody tr:not(.hidden-row)'));
    if (visibleRows.length === 0) { chk.checked = false; chk.indeterminate = false; return; }
    const sel = visibleRows.filter(tr => selectedItemIndices.has(parseInt(tr.dataset.index))).length;
    chk.indeterminate = sel > 0 && sel < visibleRows.length;
    chk.checked       = sel === visibleRows.length;
}

function updateSelectionInfo() {
    const info = document.getElementById('selectionInfo');
    info.textContent = selectedItemIndices.size > 0 ? selectedItemIndices.size + ' ' + t('selected') : '';
}

function updateApplySelectedBtn() {
    const btn = document.getElementById('applySelectedBtn');
    if (btn) btn.style.display = (selectedItemIndices.size > 0 && selectedItemIndices.size < currentItems.length) ? '' : 'none';
}

// ===== FILTER =====
function applyFilter() {
    const q       = document.getElementById('filterInput').value.toLowerCase().trim();
    const clearBtn = document.getElementById('filterClearBtn');
    if (clearBtn) clearBtn.style.display = q ? '' : 'none';
    document.querySelectorAll('.file-table tbody tr').forEach(tr => {
        const name = tr.querySelector('.fname-text')?.textContent.toLowerCase() || '';
        tr.classList.toggle('hidden-row', !!(q && !name.includes(q)));
    });
    updateSelectAllCheckbox();
}

function clearFilter() {
    document.getElementById('filterInput').value = '';
    applyFilter();
}

// ===== SHOW / HIDE =====
function showFileList() {
    document.getElementById('emptyState').style.display    = 'none';
    document.getElementById('fileTableWrap').style.display = '';
    document.getElementById('infobar').style.display       = 'flex';
    document.getElementById('actionBar').style.display     = 'flex';
    hideResultLog();
}

function hideFileList() {
    document.getElementById('emptyState').style.display    = '';
    document.getElementById('fileTableWrap').style.display = 'none';
    document.getElementById('infobar').style.display       = 'none';
    document.getElementById('actionBar').style.display     = 'none';
    currentItems = [];
    selectedItemIndices.clear();
    currentPresetName = null;
    hideResultLog();
}

function hideResultLog() {
    const log = document.getElementById('resultLog');
    log.classList.remove('visible');
    log.innerHTML = '';
}

// ===== RESET =====
function resetAllNewNames() {
    document.querySelectorAll('.new-name-input').forEach(input => {
        input.value = '';
        input.classList.remove('changed');
        const dot = input.closest('tr')?.querySelector('.status-dot');
        if (dot) dot.className = 'status-dot pending';
    });
    hideResultLog();
    showToast(t('allNamesReset'), 'info');
}

function setLoading(btn, on) {
    if (!btn) return;
    btn.disabled = on;
    if (on) {
        btn.dataset.origHtml = btn.innerHTML;
        btn.innerHTML = '<svg class="spin-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>';
    } else {
        if (btn.dataset.origHtml) { btn.innerHTML = btn.dataset.origHtml; delete btn.dataset.origHtml; }
        btn.disabled = false;
    }
}

// ===== RULES LOGIC =====
let currentRuleTab  = 'text';
let activeTransform = 'none';
let activeRules     = { prefix: false, suffix: false, replace: false, remove: false, slice: false, extension: false };

function switchRuleTab(tab) {
    currentRuleTab = tab;
    document.querySelectorAll('.stab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.querySelectorAll('.stab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(tab + 'Tab').classList.add('active');
    if (tab === 'number') updateNumberPreview();
    updateRulesBadge();
}

function toggleRule(rule) {
    activeRules[rule] = !activeRules[rule];
    document.getElementById(rule + 'Btn').classList.toggle('active', activeRules[rule]);
    const field = document.getElementById(rule + 'Rule');
    if (activeRules[rule]) {
        field.style.display = 'block';
        requestAnimationFrame(() => {
            const inp = field.querySelector('input');
            if (inp) inp.focus();
        });
    } else {
        field.style.display = 'none';
    }
    updateRulesBadge();
}

function selectTransform(transform) {
    activeTransform = transform;
    document.querySelectorAll('.topt').forEach(t => t.classList.remove('active'));
    if (transform !== 'none') {
        const el = document.getElementById('transform-' + transform);
        if (el) el.classList.add('active');
    }
    updateRulesBadge();
}

function updateRulesBadge() {
    const numericPrefix = document.getElementById('numericPrefix')?.value || '';
    const numericStart = parseInt(document.getElementById('numericStart')?.value) || 1;
    const numericPadding = parseInt(document.getElementById('numericPadding')?.value) || 3;
    const hasNumberingRule = currentRuleTab === 'number' && (numericPrefix !== '' || numericStart !== 1 || numericPadding !== 3);
    const count =
        (activeRules.prefix  ? 1 : 0) +
        (activeRules.suffix  ? 1 : 0) +
        (activeRules.replace ? 1 : 0) +
        (activeRules.remove  ? 1 : 0) +
        (activeRules.slice   ? 1 : 0) +
        (activeRules.extension ? 1 : 0) +
        (activeTransform !== 'none' ? 1 : 0) +
        (hasNumberingRule ? 1 : 0);
    const badge = document.getElementById('rulesBadge');
    badge.textContent = count;
    badge.style.display = count > 0 ? '' : 'none';
}

function updateNumberPreview() {
    const start   = parseInt(document.getElementById('numericStart').value)   || 1;
    const padding = parseInt(document.getElementById('numericPadding').value) || 3;
    const prefix  = document.getElementById('numericPrefix').value || '';
    const list    = document.getElementById('numberPreviewList');
    list.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const span = document.createElement('span');
        span.className = 'preview-num';
        span.textContent = prefix + String(start + i).padStart(padding, '0') + (i === 0 ? '.txt' : '');
        list.appendChild(span);
    }
}

function clearAllRules() {
    currentPresetName = null;
    activeRules = { prefix: false, suffix: false, replace: false, remove: false, slice: false, extension: false };
    ['prefix','suffix','replace','remove','slice','extension'].forEach(r => {
        document.getElementById(r + 'Btn')?.classList.remove('active');
        const el = document.getElementById(r + 'Rule');
        if(el) el.style.display = 'none';
    });
    document.getElementById('prefixInput').value  = '';
    document.getElementById('suffixInput').value  = '';
    document.getElementById('replaceFind').value  = '';
    document.getElementById('replaceWith').value  = '';
    document.getElementById('removeText').value   = '';
    document.getElementById('sliceFirst').value   = '0';
    document.getElementById('sliceLast').value    = '0';
    document.getElementById('extensionInput').value = '';
    selectTransform('none');
    document.getElementById('numericStart').value   = '1';
    document.getElementById('numericPadding').value = '3';
    document.getElementById('numericPrefix').value  = '';
    metadataToggle = false;
    const metaToggle = document.getElementById('metaToggle');
    const metaToolbarBtn = document.getElementById('metaToolbarBtn');
    if (metaToggle) metaToggle.classList.remove('active');
    if (metaToolbarBtn) metaToolbarBtn.classList.remove('active');
    updateNumberPreview();
    updateRulesBadge();
    showToast(t('allRulesCleared'), 'info');
}

function toggleMetadata() {
    metadataToggle = !metadataToggle;
    const metaToggle = document.getElementById('metaToggle');
    const metaToolbarBtn = document.getElementById('metaToolbarBtn');
    if (metaToggle) metaToggle.classList.toggle('active', metadataToggle);
    if (metaToolbarBtn) metaToolbarBtn.classList.toggle('active', metadataToggle);
    updateRulesBadge();
}

// ===== APPLY RULES =====

// متغیرهای پویا (Dynamic Variables)
function parseDynamicVars(text, itemPath) {
    if(!text) return '';
    const dateStr = new Date().toISOString().split('T')[0]; // تاریخ امروز
    const pathParts = itemPath.replace(/\\/g, '/').split('/').filter(Boolean);
    const parentFolder = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'folder';
    return text.replace(/\[DATE\]/g, dateStr).replace(/\[PARENT\]/g, parentFolder);
}

function applyRulesToItems(indicesArray) {
    const prefix      = document.getElementById('prefixInput').value;
    const suffix      = document.getElementById('suffixInput').value;
    const find        = document.getElementById('replaceFind').value;
    const replaceWith = document.getElementById('replaceWith').value;
    const removeStr   = document.getElementById('removeText').value;
    
    const sliceFirst = parseInt(document.getElementById('sliceFirst').value) || 0;
    const sliceLast  = parseInt(document.getElementById('sliceLast').value) || 0;
    const newExtVal  = document.getElementById('extensionInput').value.trim().replace('.', '');

    const numericStart   = parseInt(document.getElementById('numericStart').value)   || 1;
    const numericPadding = parseInt(document.getElementById('numericPadding').value) || 3;
    const numericPrefix  = document.getElementById('numericPrefix').value;

    const isNumberingTab = currentRuleTab === 'number';
    let count = 0;

    indicesArray.forEach((index, seqIndex) => {
        const input = document.querySelector('.new-name-input[data-index="' + index + '"]');
        if (!input) return;
        const item = currentItems[index];
        if (!item) return;

        let fileExt = '';
        let origExt = '';
        
        if (activeRules.extension && item.type === 'file') {
            fileExt = newExtVal ? '.' + newExtVal : '';
            const dotIndex = item.name.lastIndexOf('.');
            if (dotIndex > 0) {
                origExt = item.name.substring(dotIndex);
            }
        } else if (item.type === 'file') {
            const dotIndex = item.name.lastIndexOf('.');
            if (dotIndex > 0) {
                origExt = item.name.substring(dotIndex);
                fileExt = origExt;
            } else {
                fileExt = '';
            }
        }

        // Start from the bare basename — fileExt is re-appended at the end of this
        // pipeline, so leaving the extension on baseName would double it up.
        let baseName = item.name;
        if (item.type === 'file') {
            if (activeRules.extension) {
                baseName = baseName.replace(/\.[^.]+$/, '');
            } else if (origExt && baseName.endsWith(origExt)) {
                baseName = baseName.slice(0, -origExt.length);
            }
        }

        let newName;
        if (isNumberingTab) {
            if (activeTransform !== 'none') baseName = applyTransform(baseName, activeTransform);
            newName = parseDynamicVars(numericPrefix, item.path) + String(numericStart + seqIndex).padStart(numericPadding, '0');
        } else {
            if (activeTransform !== 'none') baseName = applyTransform(baseName, activeTransform);
            if (activeRules.replace && find) {
                if (document.getElementById('regexChk').checked) {
                    try {
                        const regexPattern = new RegExp(find, 'g');
                        baseName = baseName.replace(regexPattern, replaceWith);
                    } catch (e) {
                        showToast(t('invalidRegex', { error: e.message }), 'warning');
                    }
                } else {
                    baseName = baseName.split(find).join(replaceWith);
                }
            }
            if (activeRules.remove && removeStr) {
                if (document.getElementById('regexChk').checked) {
                    try {
                        const regexPattern = new RegExp(removeStr, 'g');
                        baseName = baseName.replace(regexPattern, '');
                    } catch (e) {
                        showToast(t('invalidRemoveRegex', { error: e.message }), 'warning');
                    }
                } else {
                    baseName = baseName.split(removeStr).join('');
                }
            }
            
            if (activeRules.slice) {
                const sliceEnd = Math.max(sliceFirst, baseName.length - sliceLast);
                baseName = baseName.substring(sliceFirst, sliceEnd);
            }
            
            if (activeRules.prefix && prefix) baseName = parseDynamicVars(prefix, item.path) + baseName;
            if (activeRules.suffix && suffix) baseName = baseName + parseDynamicVars(suffix, item.path);
            
            newName = baseName;
        }

        if (fileExt) newName += fileExt;
        input.value = newName;
        input.classList.toggle('changed', newName !== item.name);
        count++;
    });

    return count;
}

function applyAllRules() {
    if (currentItems.length === 0) { showToast(t('loadFolderFirst'), 'warning'); return; }
    const indices = currentItems.map((_, i) => i);
    const count = applyRulesToItems(indices);
    const resolved = resolveNameConflicts(indices);
    showToast(t('rulesApplied', { count, suffix: count !== 1 ? 's' : '' }), 'success');
    if (resolved > 0) {
        showToast(t('conflictsResolved', { count: resolved, suffix: resolved !== 1 ? 's' : '' }), 'info');
    }
}

function applyRulesToSelected() {
    const selected = Array.from(selectedItemIndices).sort((a, b) => a - b);
    if (selected.length === 0) { showToast(t('noItemsSelected'), 'warning'); return; }
    const count = applyRulesToItems(selected);
    const resolved = resolveNameConflicts(selected);
    showToast(t('rulesAppliedSelected', { count, suffix: count !== 1 ? 's' : '' }), 'success');
    if (resolved > 0) {
        showToast(t('conflictsResolved', { count: resolved, suffix: resolved !== 1 ? 's' : '' }), 'info');
    }
}

// Split a filename into base + extension. Folders / dotfiles → ext = ''.
function splitNameExt(name) {
    const dotIndex = name.lastIndexOf('.');
    if (dotIndex <= 0) return { base: name, ext: '' };
    return { base: name.substring(0, dotIndex), ext: name.substring(dotIndex) };
}

// After rules are applied, walk the batch and rewrite any colliding new name to
// "base (1).ext", "base (2).ext", ... until unique within its parent directory.
// Two kinds of collisions are resolved:
//   - cross-batch: two renamed items targeting the same new name
//   - external: a renamed item targeting the current name of an item NOT in this batch
// Items that ARE in the batch don't block — their old name is about to be freed.
function resolveNameConflicts(indicesArray) {
    const indexSet = new Set(indicesArray);
    const parentOf = (item) => item.path.replace(/\\/g, '/').split('/').slice(0, -1).join('/').toLowerCase();

    const existingByKey = new Map();
    currentItems.forEach((item, idx) => {
        if (indexSet.has(idx)) return;
        existingByKey.set(parentOf(item) + '/' + item.name.toLowerCase(), idx);
    });

    const claimed = new Set();
    let resolvedCount = 0;

    indicesArray.forEach(index => {
        const item = currentItems[index];
        const input = document.querySelector('.new-name-input[data-index="' + index + '"]');
        if (!item || !input) return;
        const parent = parentOf(item);
        let newName = input.value.trim() || item.name;

        const collides = (candidate) => {
            const key = parent + '/' + candidate.toLowerCase();
            return claimed.has(key) || existingByKey.has(key);
        };

        if (collides(newName)) {
            const { base, ext } = splitNameExt(newName);
            let i = 1, candidate;
            do {
                candidate = base + ' (' + i + ')' + ext;
                i++;
            } while (collides(candidate) && i < 10000);
            newName = candidate;
            input.value = newName;
            input.classList.add('changed');
            resolvedCount++;
        }

        claimed.add(parent + '/' + newName.toLowerCase());
    });

    return resolvedCount;
}

function applyTransform(text, transform) {
    switch (transform) {
        case 'lowercase':  return text.toLowerCase();
        case 'uppercase':  return text.toUpperCase();
        case 'capitalize': return text.replace(/\b\w/g, c => c.toUpperCase());
        case 'snake_case': return text.replace(/[\s\-]+/g, '_').toLowerCase();
        case 'camelCase': {
            const words = text.replace(/[^a-zA-Z0-9]+/g, ' ').trim().split(' ');
            return words.map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
        }
        case 'kebab-case': return text.replace(/[\s_]+/g, '-').toLowerCase();
        case 'trim':       return text.replace(/\s+/g, ' ').trim();
        default:           return text;
    }
}

// ===== PREVIEW & RENAME & UNDO =====
// ===== VALIDATE =====
// Scan new names for problems before committing the rename: invalid characters,
// reserved Windows names, length limits, trailing dot/space, and collisions with
// other rows or existing files in the same folder. Replaces the old preview button
// since new names are already visible inline in the table.

const VALIDATION_RESERVED_NAMES = new Set([
    'CON','PRN','AUX','NUL',
    'COM1','COM2','COM3','COM4','COM5','COM6','COM7','COM8','COM9',
    'LPT1','LPT2','LPT3','LPT4','LPT5','LPT6','LPT7','LPT8','LPT9'
]);
const VALIDATION_INVALID_CHARS_RE = /[<>:"\/\\|?*]/g;
const VALIDATION_CONTROL_CHARS_RE = /[\x00-\x1f]/;

function _validationParentOf(p) {
    return p.replace(/\\/g, '/').split('/').slice(0, -1).join('/').toLowerCase();
}

function _checkSingleName(name) {
    const problems = [];
    if (!name) { problems.push({ key: 'issueEmptyName' }); return problems; }
    if (name.length > 255) problems.push({ key: 'issueTooLong', params: { len: name.length } });
    const bad = name.match(VALIDATION_INVALID_CHARS_RE);
    if (bad) {
        const unique = [...new Set(bad)].join(' ');
        problems.push({ key: 'issueInvalidChar', params: { char: unique } });
    }
    if (VALIDATION_CONTROL_CHARS_RE.test(name)) problems.push({ key: 'issueControlChar' });
    const baseUpper = name.replace(/\.[^.]+$/, '').toUpperCase();
    if (VALIDATION_RESERVED_NAMES.has(baseUpper)) problems.push({ key: 'issueReservedName' });
    if (/[\s.]$/.test(name)) problems.push({ key: 'issueTrailingDot' });
    if (/^\s/.test(name))    problems.push({ key: 'issueLeadingSpace' });
    return problems;
}

// Returns true if at least one new-name input has a value different from its original.
function hasAnyPendingNewName() {
    for (let i = 0; i < currentItems.length; i++) {
        const input = document.querySelector('.new-name-input[data-index="' + i + '"]');
        if (!input) continue;
        const v = input.value.trim();
        if (v && v !== currentItems[i].name) return true;
    }
    return false;
}

// Always run the active rules against the chosen scope (selection if any,
// else all items). Per-item: skip only those the user has typed into
// directly, so "set rule, click Rename" works even if the user previously
// typed into other rows.
function autoApplyRulesIfNeeded() {
    if (currentItems.length === 0) return false;

    const selected = Array.from(selectedItemIndices);
    const scope = selected.length > 0 ? selected.slice().sort((a, b) => a - b) : currentItems.map((_, i) => i);

    const indicesToApply = scope.filter(idx => {
        const input = document.querySelector('.new-name-input[data-index="' + idx + '"]');
        if (!input) return false;
        const v = input.value.trim();
        const item = currentItems[idx];
        if (!item) return false;
        return !v || v === item.name;
    });

    if (indicesToApply.length > 0) {
        applyRulesToItems(indicesToApply);
        resolveNameConflicts(scope);
    }
    return true;
}

function runNameValidation() {
    const log = document.getElementById('resultLog');

    autoApplyRulesIfNeeded();

    // Reset every status dot back to pending so previous validation marks don't linger.
    document.querySelectorAll('.new-name-input').forEach(input => {
        const dot = input.closest('tr')?.querySelector('.status-dot');
        if (dot) dot.className = 'status-dot pending';
    });

    // Collect the rows that actually have a new name (different from the original).
    const renamed = [];
    currentItems.forEach((item, index) => {
        const input = document.querySelector('.new-name-input[data-index="' + index + '"]');
        if (!input) return;
        const newName = input.value.trim();
        if (!newName || newName === item.name) return;
        const dot = input.closest('tr')?.querySelector('.status-dot') || null;
        renamed.push({ index, oldName: item.name, newName, parent: _validationParentOf(item.path), dot });
    });

    if (renamed.length === 0) {
        showToast(t('noItemsToValidate'), 'warning');
        log.classList.remove('visible');
        log.innerHTML = '';
        return;
    }

    // Build a set of existing filenames per parent (excluding rows being renamed),
    // so we can detect collisions with files that will stay on disk.
    const renamedIndices = new Set(renamed.map(r => r.index));
    const existingByParent = new Map();
    currentItems.forEach((item, index) => {
        if (renamedIndices.has(index)) return;
        const p = _validationParentOf(item.path);
        if (!existingByParent.has(p)) existingByParent.set(p, new Set());
        existingByParent.get(p).add(item.name.toLowerCase());
    });

    // Track first occurrence of each new name in each parent so later duplicates flag.
    const firstSeenByParent = new Map();
    renamed.forEach(r => {
        if (!firstSeenByParent.has(r.parent)) firstSeenByParent.set(r.parent, new Map());
        const m = firstSeenByParent.get(r.parent);
        const k = r.newName.toLowerCase();
        if (!m.has(k)) m.set(k, r.index);
    });

    const issues = [];
    renamed.forEach(r => {
        const rowProblems = _checkSingleName(r.newName);

        const lk = r.newName.toLowerCase();
        const firstIdx = firstSeenByParent.get(r.parent)?.get(lk);
        if (firstIdx !== undefined && firstIdx !== r.index) {
            rowProblems.push({ key: 'issueDuplicate' });
        }
        const existing = existingByParent.get(r.parent);
        if (existing && existing.has(lk)) {
            rowProblems.push({ key: 'issueCollision' });
        }

        if (rowProblems.length > 0) {
            if (r.dot) r.dot.className = 'status-dot error';
            rowProblems.forEach(p => issues.push({
                oldName: r.oldName,
                newName: r.newName,
                problem: t(p.key, p.params)
            }));
        } else {
            if (r.dot) r.dot.className = 'status-dot success';
        }
    });

    if (issues.length === 0) {
        const msg = t('allNamesValid', { count: renamed.length, suffix: renamed.length !== 1 ? 's' : '' });
        log.innerHTML =
            '<div class="log-header">' + t('validationHeader') + '</div>' +
            '<div class="log-entry log-success">' + escapeHtml(msg) + '</div>';
        log.classList.add('visible');
        showToast(msg, 'success');
        return;
    }

    log.innerHTML = '<div class="log-header">' + t('validationHeader') + ' — ' + issues.length + '</div>';
    issues.forEach(iss => {
        const entry = document.createElement('div');
        entry.className = 'log-entry log-error';
        entry.innerHTML =
            '<span>' + escapeHtml(iss.newName) + '</span>' +
            '<span class="log-arrow"> · </span>' +
            '<span>' + escapeHtml(iss.problem) + '</span>';
        log.appendChild(entry);
    });
    log.classList.add('visible');
    showToast(t('foundIssues', { count: issues.length, suffix: issues.length !== 1 ? 's' : '' }), 'error');
}

async function executeRename() {
    await executeRenameWithValidation();
}

async function undoRename() {
    const btn = document.getElementById('undoBtn');
    setLoading(btn, true);
    try {
        const result = await window.pywebview.api.undo_last();
        if (result.success) {
            showToast(t('undidRename', { count: result.restored }), 'success');
            btn.style.display = 'none'; // مخفی کردن دکمه بعد از بازگردانی
            await loadPath(); // رفرش کردن لیست
        } else {
            showToast(result.error || t('failedUndo'), 'error');
        }
    } catch (err) {
        showToast(t('undoFailed', { error: err }), 'error');
    } finally {
        setLoading(btn, false);
    }
}

function setRowStatus(oldName, status) {
    document.querySelectorAll('.fname-text').forEach(el => {
        if (el.textContent === oldName) {
            const dot = el.closest('tr')?.querySelector('.status-dot');
            if (dot) dot.className = 'status-dot ' + status;
        }
    });
}

function getItemsForRename() {
    // If nothing is checked, fall back to all items — same scope as Rename All implies.
    const scopeFilter = selectedItemIndices.size > 0
        ? ((_, i) => selectedItemIndices.has(i))
        : () => true;
    const result = currentItems
        .filter(scopeFilter)
        .map((item, _ignored) => {
            const index   = currentItems.indexOf(item);
            const input   = document.querySelector('.new-name-input[data-index="' + index + '"]');
            const newName = input ? input.value.trim() : '';
            const parentPath = item.path.replace(/\\/g, '/').split('/').slice(0, -1).join('/');
            const newPath = parentPath ? parentPath + '/' + (newName || item.name) : (newName || item.name);
            return { index, name: item.name, path: item.path, newPath, type: item.type, extension: item.extension, oldName: item.name, newName: newName || item.name };
        })
        .filter(item => item.newName && item.newName !== '' && item.newName !== item.oldName);
    return result;
}

async function removeMetadataForItems(items) {
    if (!metadataToggle || items.length === 0) return;
    try {
        const files = items.filter(i => i.type === 'file').map(i => i.newPath || i.path);
        if (files.length > 0) {
            await window.pywebview.api.remove_metadata(files);
        }
    } catch (e) {
        showToast(t('metadataFailed', { error: e.message }), 'warning');
    }
}

// ===== ABOUT =====
function showAbout() {
    const ICON_BATCH   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/></svg>';
    const ICON_FILTER  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z"/></svg>';
    const ICON_RULES   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/></svg>';
    const ICON_PREVIEW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
    const ICON_PYTHON  = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-2.2 0-4 .8-4 3v2h4v1H6c-2.2 0-4 1.5-4 4.5S3.8 17 6 17h2v-2.5c0-1.4 1.1-2.5 2.5-2.5h4c1.4 0 2.5-1.1 2.5-2.5V5c0-2.2-1.8-3-4-3h-1Zm-2 2.5a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1Z" opacity=".95"/><path d="M14 22c2.2 0 4-.8 4-3v-2h-4v-1h6c2.2 0 4-1.5 4-4.5S22.2 7 20 7h-2v2.5c0 1.4-1.1 2.5-2.5 2.5h-4C10.1 12 9 13.1 9 14.5V19c0 2.2 1.8 3 4 3h1Zm2-2.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1Z" opacity=".75"/></svg>';
    const techChips = [
        { name:'Python',     dot:'#3776ab' },
        { name:'JavaScript', dot:'#f7df1e' },
        { name:'HTML5',      dot:'#e34f26' },
        { name:'CSS3',       dot:'#1572b6' },
        { name:'pywebview',  dot:'#7c6dfa' }
    ].map(c => '<span class="tech-chip"><span class="tech-dot" style="background:'+c.dot+'"></span>'+c.name+'</span>').join('');

    document.getElementById('aboutModalBody').innerHTML =
        '<div class="about-description about-anim" style="--d:.02s"><p>' + t('aboutDescription') + '</p></div>' +
        '<div class="about-features about-anim" style="--d:.06s">' +
            '<div class="feature-card"><div class="feature-icon">' + ICON_BATCH   + '</div><div class="feature-text"><h4>' + t('aboutBatchTitle')   + '</h4><p>' + t('aboutBatchBody')   + '</p></div></div>' +
            '<div class="feature-card"><div class="feature-icon">' + ICON_FILTER  + '</div><div class="feature-text"><h4>' + t('aboutFilterTitle')  + '</h4><p>' + t('aboutFilterBody')  + '</p></div></div>' +
            '<div class="feature-card"><div class="feature-icon">' + ICON_RULES   + '</div><div class="feature-text"><h4>' + t('aboutRulesTitle')   + '</h4><p>' + t('aboutRulesBody')   + '</p></div></div>' +
            '<div class="feature-card"><div class="feature-icon">' + ICON_PREVIEW + '</div><div class="feature-text"><h4>' + t('aboutPreviewTitle') + '</h4><p>' + t('aboutPreviewBody') + '</p></div></div>' +
        '</div>' +
        '<div class="about-section-label about-anim" style="--d:.10s">' + t('builtWith') + '</div>' +
        '<div class="about-tech about-anim" style="--d:.12s">' + techChips + '</div>' +
        '<div class="about-divider about-anim" style="--d:.16s"></div>' +
        '<div class="about-developer about-anim" style="--d:.18s">' +
            '<div class="developer-label">' + t('developedBy') + '</div>' +
            '<div class="developer-card-v2">' +
                '<div class="dev-avatar">' +
                    '<span class="dev-avatar-ring"></span>' +
                    '<span class="dev-avatar-circle">EM</span>' +
                    '<span class="dev-avatar-status"></span>' +
                '</div>' +
                '<div class="dev-info-col">' +
                    '<div class="developer-name">E.MKH</div>' +
                    '<div class="dev-role-badge">' +
                        '<span class="dev-role-icon">' + ICON_PYTHON + '</span>' +
                        '<span>' + t('developerRole') + '</span>' +
                    '</div>' +
                    '<div class="dev-tagline">' + t('developerTagline') + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="social-links">' +
                '<a href="https://github.com/esmail-mkh" target="_blank" class="social-link github"><svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.208 11.385.6.105.825-.255.825-.57 0-.285-.012-1.29-.012-2.34-3.338.72-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.777.42-1.305.763-1.605-2.665-.3-5.466-1.332-5.475-5.93 0-1.31.465-2.38 1.235-3.22-.135-.3-.54-1.525.105-3.175 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.65.24 2.875.12 3.175.77.84 1.235 1.91 1.235 3.22 0 4.61-2.805 5.625-5.475 5.925.435.375.81 1.096.81 2.22 0 1.605-.012 2.895-.012 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>GitHub</a>' +
                '<a href="https://t.me/esisensei" target="_blank" class="social-link telegram"><svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.259-.48-1.94-.94-1.056-.732-1.653-1.187-2.678-1.902-1.185-.833-.417-1.28.258-1.98.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.018-1.627 4.474-1.635z"/></svg>Telegram</a>' +
            '</div>' +
        '</div>' +
        '<div class="about-shortcut about-anim" style="--d:.22s; margin-top:14px"><span>' + t('press') + '</span><kbd>Esc</kbd><span>' + t('toClose') + '</span></div>';
    document.getElementById('aboutOverlay').classList.add('visible');
}
function closeAbout() { document.getElementById('aboutOverlay').classList.remove('visible'); }

// ===== RESULT LOG HEADER STYLE =====
const _logStyle = document.createElement('style');
_logStyle.textContent = `
    .log-header { font-size:10.5px; font-weight:700; letter-spacing:.9px; text-transform:uppercase; color:var(--text2); margin-bottom:8px; }
    @keyframes spinAnim { to { transform:rotate(360deg); } }
    .spin-icon { animation:spinAnim .7s linear infinite; }
`;
document.head.appendChild(_logStyle);

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'V') { e.preventDefault(); pasteAndLoad(); }
    if (e.ctrlKey && !e.shiftKey && e.key === 'Enter') { e.preventDefault(); loadPath(); }
    if (e.ctrlKey && e.key === 's') { e.preventDefault(); if (currentItems.length > 0) executeRename(); }
    if (e.key === 'Escape') { closeModal(); closeAbout(); closeSavePresetModal(); }
});

document.getElementById('pathInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); loadPath(); }
});

// ===== PRESETS =====
let presetsOpen = false;
let currentPresetName = null;

// ===== RULE REORDER (DRAG & DROP) =====
let draggedRule = null;

function initRuleDragDrop() {
    const groups = document.querySelectorAll('.rule-group-item');
    groups.forEach(group => {
        group.setAttribute('draggable', 'true');
        group.addEventListener('dragstart', handleTextRuleDragStart);
        group.addEventListener('dragend', handleTextRuleDragEnd);
        group.addEventListener('dragover', handleTextRuleDragOver);
        group.addEventListener('drop', handleTextRuleDrop);
    });
    initSidebarTabDragDrop();
}

let textDragGroup = null;

function handleTextRuleDragStart(e) {
    textDragGroup = this.closest('.rule-group-item');
    if (textDragGroup) {
        textDragGroup.style.opacity = '0.4';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');
    }
}

function handleTextRuleDragEnd() {
    if (textDragGroup) {
        textDragGroup.style.opacity = '1';
        textDragGroup.classList.remove('dragging');
    }
    textDragGroup = null;
    document.querySelectorAll('.rule-group-item').forEach(g => {
        g.classList.remove('drag-over');
        g.classList.remove('drop-target');
    });
}

function handleTextRuleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const group = this.closest('.rule-group-item');
    if (group && group !== textDragGroup) {
        document.querySelectorAll('.rule-group-item').forEach(g => {
            if (g !== group && g !== textDragGroup) {
                g.classList.remove('drop-target');
            }
        });
        group.classList.add('drop-target');
    }
}

function handleTextRuleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const targetGroup = this.closest('.rule-group-item');
    if (!targetGroup || !textDragGroup || targetGroup === textDragGroup) return;
    
    const parent = textDragGroup.parentNode;
    const allGroups = Array.from(parent.querySelectorAll('.rule-group-item'));
    const dragIdx = allGroups.indexOf(textDragGroup);
    const dropIdx = allGroups.indexOf(targetGroup);
    
    if (dragIdx < dropIdx) {
        parent.insertBefore(textDragGroup, targetGroup.nextSibling);
    } else {
        parent.insertBefore(textDragGroup, targetGroup);
    }
    
    textDragGroup.style.opacity = '1';
    textDragGroup.classList.remove('dragging');
    textDragGroup = null;
    allGroups.forEach(g => {
        g.classList.remove('drag-over');
        g.classList.remove('drop-target');
    });
    
    // Save the new order to settings
    saveTextRuleOrder();
}

async function saveTextRuleOrder() {
    try {
        const groups = document.querySelectorAll('#textTab .rule-group-item');
        const order = Array.from(groups).map(g => {
            const btn = g.querySelector('.rtoggle');
            return btn ? btn.getAttribute('onclick').replace("toggleRule('", "").replace("')", "") : '';
        }).filter(Boolean);

        await window.pywebview.api.save_settings({ textRuleOrder: order });
    } catch (e) {
       console.error('Failed to save rule order:', e);
    }
}

// ===== SIDEBAR TAB DRAG & DROP =====
let draggedSidebarTab = null;

function initSidebarTabDragDrop() {
    const tabs = document.querySelectorAll('.stab[data-sidebar-order]');
    tabs.forEach(tab => {
        tab.setAttribute('draggable', 'true');
        tab.addEventListener('dragstart', handleSidebarTabDragStart);
        tab.addEventListener('dragend', handleSidebarTabDragEnd);
        tab.addEventListener('dragover', handleSidebarTabDragOver);
        tab.addEventListener('drop', handleSidebarTabDrop);
    });
}

function handleSidebarTabDragStart(e) {
    draggedSidebarTab = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
}

function handleSidebarTabDragEnd() {
    if (draggedSidebarTab) {
        draggedSidebarTab.classList.remove('dragging');
        draggedSidebarTab.classList.remove('drop-indicator');
    }
    draggedSidebarTab = null;
    document.querySelectorAll('.stab').forEach(t => {
        t.classList.remove('drag-over-tab');
        t.classList.remove('dragging');
        t.classList.remove('drop-indicator');
    });
}

function handleSidebarTabDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this !== draggedSidebarTab && draggedSidebarTab) {
        this.classList.add('drop-indicator');
    }
}

function handleSidebarTabDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.remove('drag-over-tab');
    if (draggedSidebarTab === this || !draggedSidebarTab) return;
    
    const tabsContainer = draggedSidebarTab.parentNode;
    const allTabs = Array.from(tabsContainer.querySelectorAll('.stab'));
    const allPanels = document.querySelectorAll('.stab-panel');
    
    const draggedIdx = allTabs.indexOf(draggedSidebarTab);
    const targetIdx = allTabs.indexOf(this);
    
    if (draggedIdx < targetIdx) {
        tabsContainer.insertBefore(draggedSidebarTab, this.nextSibling);
    } else {
        tabsContainer.insertBefore(draggedSidebarTab, this);
    }
    
    // Move panels to match tab order
    const tabOrder = Array.from(tabsContainer.querySelectorAll('.stab')).map(t => t.dataset.tab);
    const panelMap = {};
    allPanels.forEach(panel => {
        panelMap[panel.id] = panel;
    });
    
    const panelsContainer = document.querySelector('.sidebar-scroll');
    tabOrder.forEach(tabName => {
        const panelId = tabName + 'Tab';
        const panel = panelMap[panelId];
        if (panel) {
            panelsContainer.appendChild(panel);
        }
    });
    
   // Update active state if needed
    switchRuleTab(currentRuleTab);
    
    saveSidebarTabOrder();
}

async function saveSidebarTabOrder() {
    try {
        const tabs = document.querySelectorAll('.sidebar-tabs .stab[data-sidebar-order]');
        const order = Array.from(tabs).map(t => t.dataset.tab);
        await window.pywebview.api.save_settings({ sidebarTabOrder: order });
    } catch (e) {
        console.error('Failed to save sidebar tab order:', e);
    }
}

// ===== VALIDATION =====
const INVALID_CHARS = /[<>:"|?*]/;
const MAX_FILENAME_LEN = 255;

function validateNames(itemsToValidate = null) {
    const warnings = [];
    const seenNewNames = new Map();
    const selectedIndexes = itemsToValidate
        ? new Set(itemsToValidate.map(item => item.index).filter(index => Number.isInteger(index)))
        : null;
    const sourceKeys = new Set((itemsToValidate || getItemsForRename()).map(item => item.path.replace(/\\/g, '/').toLowerCase()));

    document.querySelectorAll('.new-name-input').forEach(input => {
        const index = parseInt(input.dataset.index);
        if (selectedIndexes && !selectedIndexes.has(index)) return;
        const item = currentItems[index];
        if (!item) return;
        const newName = input.value.trim();
        if (!newName || newName === item.name) return;

        // Invalid characters
        if (INVALID_CHARS.test(newName)) {
            warnings.push({
                index,
                type: 'invalidChars',
                message: `"${item.name}" → new name contains invalid chars (< > : " | ? *)`
            });
        }

        // Too long filename
        if (newName.length > MAX_FILENAME_LEN) {
            warnings.push({
                index,
                type: 'tooLong',
                message: `"${item.name}" → new name too long (${newName.length}/${MAX_FILENAME_LEN} chars)`
            });
        }

        // Duplicate names
        const parentPath = item.path.replace(/\\/g, '/').split('/').slice(0, -1).join('/');
        const targetKey = (parentPath + '/' + newName).toLowerCase();
        if (seenNewNames.has(targetKey)) {
            warnings.push({
                index,
                type: 'duplicate',
                message: `"${item.name}" → duplicate new name "${newName}"`
            });
        } else {
            seenNewNames.set(targetKey, item.name);
        }

        // Existing-name conflicts are only safe when that item is also being renamed.
        currentItems.forEach((other, otherIdx) => {
            if (otherIdx === index) return;
            const otherKey = other.path.replace(/\\/g, '/').toLowerCase();
            if (targetKey === otherKey && !sourceKeys.has(otherKey)) {
                warnings.push({
                    index,
                    type: 'conflict',
                    message: `"${item.name}" → new name conflicts with existing "${other.name}"`
                });
            }
        });
    });

    return warnings;
}

function showValidationWarnings(warnings) {
    const log = document.getElementById('resultLog');
    log.innerHTML = '<div class="log-header">' + t('validationWarnings') + ' — ' + warnings.length + ' ' + t(warnings.length === 1 ? 'issue' : 'issues') + '</div>';
    warnings.forEach(w => {
        const entry = document.createElement('div');
        entry.className = 'log-entry log-warning';
        entry.innerHTML = '<span>⚠ ' + escapeHtml(w.message) + '</span>';
        log.appendChild(entry);
    });
    log.classList.add('visible');
}

// ===== EXPORT / IMPORT PRESETS =====
async function exportPresetAsFile(name) {
    try {
        const rules = {};
        ['prefix','suffix','replace','remove','slice','extension'].forEach(r => { rules[r] = activeRules[r]; });
        const numbering = {
            start: parseInt(document.getElementById('numericStart').value) || 1,
            padding: parseInt(document.getElementById('numericPadding').value) || 3,
            prefix: document.getElementById('numericPrefix').value || ''
        };
        const inputs = {
            prefix: document.getElementById('prefixInput').value || '',
            suffix: document.getElementById('suffixInput').value || '',
            replaceFind: document.getElementById('replaceFind').value || '',
            replaceWith: document.getElementById('replaceWith').value || '',
            removeText: document.getElementById('removeText').value || '',
            sliceFirst: document.getElementById('sliceFirst').value || '0',
            sliceLast: document.getElementById('sliceLast').value || '0',
            extensionInput: document.getElementById('extensionInput').value || ''
        };
        const result = await window.pywebview.api.export_preset_file(name || 'my_rules', rules, activeTransform, numbering, inputs);
        if (result.success) {
            showToast(t('presetExported'), 'success');
        } else if (result.error !== 'Cancelled') {
            showToast(t('exportFailed', { error: result.error }), 'error');
        }
    } catch (e) {
        showToast(t('exportFailed', { error: e.message }), 'error');
    }
}

async function importPresetFromFile() {
    try {
        const result = await window.pywebview.api.import_single_preset_file();
        if (result.success) {
            if (result.name) {
                showToast(t('presetsReplacedOne', { name: result.name }), 'success');
            } else {
                showToast(t('presetsReplacedMany', { count: result.count || 0 }), 'success');
            }
            loadPresetsList();
            updatePresetDropdownList();
        } else if (result.error !== 'Cancelled') {
            showToast(t('importFailed', { error: result.error }), 'error');
        }
    } catch (e) {
        showToast(t('importFailed', { error: e.message }), 'error');
    }
}

async function exportAllPresets() {
    try {
        const result = await window.pywebview.api.export_presets_file();
        if (result && result.path) {
            showToast(t('allPresetsExported', { path: result.path }), 'success');
        } else if (result && result.error && result.error !== 'Cancelled') {
            showToast(t('exportFailed', { error: result.error }), 'error');
        }
    } catch (e) {
        showToast(t('exportFailed', { error: e.message }), 'error');
    }
}

async function importAllPresets() {
    try {
        const result = await window.pywebview.api.import_presets_file_from_dialog();
        if (result && result.success) {
            showToast(t('presetsImported', { count: result.count }), 'success');
            loadPresetsList();
            updatePresetDropdownList();
        } else if (result && result.error && result.error !== 'Cancelled') {
            showToast(t('importFailed', { error: result.error }), 'error');
        }
    } catch (e) {
        showToast(t('importFailed', { error: e.message }), 'error');
    }
}

function showExportImportMenu() {
    document.getElementById('modalTitle').textContent = t('presets');
    document.getElementById('modalBody').innerHTML =
        '<div style="display:flex;flex-direction:column;gap:8px">' +
            '<button class="btn btn-primary" id="expCurrentPresetBtn" style="justify-content:center;width:100%"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' + t('exportCurrentRules') + '</button>' +
            '<button class="btn btn-secondary" id="impCurrentPresetBtn" style="justify-content:center;width:100%"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' + t('importFromFile') + '</button>' +
            '<div style="height:1px;background:var(--line);margin:4px 0"></div>' +
            '<button class="btn btn-secondary" id="expAllPresetsBtn" style="justify-content:center;width:100%"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>' + t('exportAllSavedPresets') + '</button>' +
            '<button class="btn btn-secondary" id="impAllPresetsBtn" style="justify-content:center;width:100%"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 12 12 15 15"/></svg>' + t('importSavedPresets') + '</button>' +
        '</div>';
    document.getElementById('modalConfirmBtn').style.display = 'none';
    document.getElementById('modalCancelBtn').textContent = t('close');
    document.getElementById('modalOverlay').classList.add('visible');

   document.getElementById('expCurrentPresetBtn').onclick = () => { closeModal(); exportPresetAsFile(currentPresetName || 'my_rules'); };
    document.getElementById('impCurrentPresetBtn').onclick = () => { closeModal(); importPresetFromFile(); };
    document.getElementById('expAllPresetsBtn').onclick = () => { closeModal(); exportAllPresets(); };
    document.getElementById('impAllPresetsBtn').onclick = () => { closeModal(); importAllPresets(); };
}

// ===== VALIDATED RENAME =====
async function executeRenameWithValidation() {
    autoApplyRulesIfNeeded();
    const items = getItemsForRename();
    if (items.length === 0) { showToast(t('noRenameItems'), 'warning'); return; }

    // Run client-side validation
    const warnings = validateNames(items);
    if (warnings.length > 0) {
        showValidationWarnings(warnings);
        const warningTypes = new Set(warnings.map(w => w.type));
        let msg = warnings.length + ' ' + t(warnings.length === 1 ? 'issue' : 'issues') + '. ';
        if (warningTypes.has('duplicate')) msg += t('duplicateDetected') + ' ';
        if (warningTypes.has('invalidChars')) msg += t('invalidCharsDetected') + ' ';
        if (warningTypes.has('tooLong')) msg += t('tooLongDetected') + ' ';
        showModal(t('confirmRenameWarnings'), msg + t('continueAnyway'), async () => {
            await doRename(items);
        });
    } else {
        showModal(t('confirmRename'), t('renameQuestion', { count: items.length, suffix: items.length !== 1 ? 's' : '' }), async () => {
            await doRename(items);
        });
    }
}

async function doRename(items) {
    const btn = document.getElementById('renameBtn');
    setLoading(btn, true);
    try {
        const result = await window.pywebview.api.rename_items(items, false);
        const log = document.getElementById('resultLog');
        log.innerHTML = '<div class="log-header">' + t('results') + '</div>';
        const nameMap = {};
        items.forEach(item => { nameMap[item.oldName] = item.newName; });
        const renamedMap = {};
        if (Array.isArray(result.renamed)) {
            result.renamed.forEach(item => { renamedMap[item.oldName] = item; });
        }
        result.success.forEach(oldName => {
            const entry = document.createElement('div');
            entry.className = 'log-entry log-success';
            const renamed = renamedMap[oldName];
            entry.innerHTML = '<span>✓ ' + escapeHtml(oldName) + ' → ' + escapeHtml(renamed?.newName || nameMap[oldName] || oldName) + '</span>';
            log.appendChild(entry);
        });
        result.failed.forEach((oldName, i) => {
            const entry = document.createElement('div');
            entry.className = 'log-entry log-error';
            entry.innerHTML = '<span>✕ ' + escapeHtml(oldName) + ': ' + escapeHtml(result.errors[i] || 'Unknown error') + '</span>';
            log.appendChild(entry);
        });
        log.classList.add('visible');
        result.success.forEach(n => setRowStatus(n, 'success'));
        result.failed.forEach(n  => setRowStatus(n, 'error'));
        
        if (metadataToggle) {
            const renamedItems = Array.isArray(result.renamed) && result.renamed.length > 0
                ? result.renamed
                : items.filter(i => result.success.includes(i.oldName));
            await removeMetadataForItems(renamedItems);
        }
        
        if (result.success.length > 0) {
            const undoBtn = document.getElementById('undoBtn');
            if(undoBtn) undoBtn.style.display = 'inline-flex';
        }
        if (result.failed.length > 0)
            showToast(t('renamedSummary', { success: result.success.length, failed: result.failed.length }), 'warning');
        else
            showToast(t('renamedSuccess', { count: result.success.length }), 'success');
        await loadPath(true);
    } catch (err) {
        showToast(t('renameFailed', { error: err.message || err }), 'error');
    } finally {
        setLoading(btn, false);
    }
}

function togglePresetsSection() {
    presetsOpen = !presetsOpen;
    const body = document.getElementById('presetsBody');
    if (body) body.style.display = presetsOpen ? 'block' : 'none';
    const chev = document.querySelector('.presets-chevron');
    if (chev) chev.style.transform = presetsOpen ? 'rotate(90deg)' : '';
    if (presetsOpen) loadPresetsList();
}

async function loadPresetsList() {
    try {
        const result = await window.pywebview.api.list_presets();
        const list = document.getElementById('presetsList');
        if (!result.presets || result.presets.length === 0) {
            if (list) list.innerHTML = '<div class="presets-empty">' + t('noSavedPresets') + '</div>';
            return;
        }
        if (!list) return;
        list.innerHTML = '';
        result.presets.forEach(p => {
            const item = document.createElement('div');
            const isActive = p.name === currentPresetName;
            item.className = 'preset-item' + (isActive ? ' preset-active' : '');
            const dateStr = p.created_at ? new Date(p.created_at).toLocaleDateString() : '';
            item.innerHTML =
                '<div class="preset-info">' +
                    '<div class="preset-name">' + escapeHtml(p.name) + '</div>' +
                    (dateStr ? '<div class="preset-date">' + dateStr + '</div>' : '') +
                    (isActive ? '<div class="preset-active-label">' + t('active') + '</div>' : '') +
                '</div>' +
                '<div class="preset-actions">' +
                    '<button class="preset-btn preset-load" onclick="loadPreset(\'' + escapeHtml(p.name).replace(/'/g, "\\'") + '\')" title="' + escapeHtml(t('loadPreset')) + '">' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
                    '</button>' +
                    '<button class="preset-btn preset-delete" onclick="deletePreset(\'' + escapeHtml(p.name).replace(/'/g, "\\'") + '\')" title="' + escapeHtml(t('deletePreset')) + '">' +
                        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>' +
                    '</button>' +
                '</div>';
            list.appendChild(item);
        });
    } catch (e) {
        showToast(t('loadPresetsFailed', { error: e.message }), 'error');
    }
}

function showSavePresetModal() {
    document.getElementById('savePresetOverlay').classList.add('visible');
    setTimeout(() => document.getElementById('presetNameInput').focus(), 100);
}

function closeSavePresetModal() {
    document.getElementById('savePresetOverlay').classList.remove('visible');
    document.getElementById('presetNameInput').value = '';
}

async function savePreset() {
    const name = document.getElementById('presetNameInput').value.trim();
    if (!name) { showToast(t('presetNameRequired'), 'warning'); return; }
    try {
        const rules = {};
        ['prefix','suffix','replace','remove','slice','extension'].forEach(r => { rules[r] = activeRules[r]; });
        const numbering = {
            start: parseInt(document.getElementById('numericStart').value) || 1,
            padding: parseInt(document.getElementById('numericPadding').value) || 3,
            prefix: document.getElementById('numericPrefix').value || ''
        };
        const inputs = {
            prefix: document.getElementById('prefixInput').value || '',
            suffix: document.getElementById('suffixInput').value || '',
            replaceFind: document.getElementById('replaceFind').value || '',
            replaceWith: document.getElementById('replaceWith').value || '',
            removeText: document.getElementById('removeText').value || '',
            sliceFirst: document.getElementById('sliceFirst').value || '0',
            sliceLast: document.getElementById('sliceLast').value || '0',
            extensionInput: document.getElementById('extensionInput').value || '',
            useRegex: document.getElementById('regexChk').checked
        };
        const result = await window.pywebview.api.save_preset(name, rules, activeTransform, numbering, inputs);
        if (result.success) {
            showToast(t('presetSaved', { name }), 'success');
            closeSavePresetModal();
            loadPresetsList();
        }
    } catch (e) {
        showToast(t('savePresetFailed', { error: e.message }), 'error');
    }
}

async function loadPreset(name) {
    try {
        const result = await window.pywebview.api.get_preset(name);
        if (result.error) {
            showToast(result.error, 'error');
            return;
        }
        const preset = result.preset;
        const rules = preset.rules || {};
        
        // Toggle text rules
        ['prefix', 'suffix', 'replace', 'remove', 'slice', 'extension'].forEach(rule => {
            const btn = document.getElementById(rule + 'Btn');
            if (!btn) return;
            if (rules[rule] && !activeRules[rule]) toggleRule(rule);
            else if (!rules[rule] && activeRules[rule]) toggleRule(rule);
        });

        // Set transform
        const transform = preset.transform || 'none';
        selectTransform(transform);

        // Set numbering
        const num = preset.numbering || {};
        document.getElementById('numericStart').value = num.start || 1;
        document.getElementById('numericPadding').value = num.padding || 3;
        document.getElementById('numericPrefix').value = num.prefix || '';

        // Set text rule inputs from saved data
        const inputs = preset.inputs || {};
        if (inputs.prefix !== undefined) document.getElementById('prefixInput').value = inputs.prefix || '';
        if (inputs.suffix !== undefined) document.getElementById('suffixInput').value = inputs.suffix || '';
        if (inputs.replaceFind !== undefined) document.getElementById('replaceFind').value = inputs.replaceFind || '';
        if (inputs.replaceWith !== undefined) document.getElementById('replaceWith').value = inputs.replaceWith || '';
        if (inputs.removeText !== undefined) document.getElementById('removeText').value = inputs.removeText || '';
        if (inputs.sliceFirst !== undefined) document.getElementById('sliceFirst').value = inputs.sliceFirst || '0';
        if (inputs.sliceLast !== undefined) document.getElementById('sliceLast').value = inputs.sliceLast || '0';
        if (inputs.extensionInput !== undefined) document.getElementById('extensionInput').value = inputs.extensionInput || '';
        if (inputs.useRegex !== undefined) {
            document.getElementById('regexChk').checked = !!inputs.useRegex;
            const hint = document.getElementById('regexHint');
            if (hint) hint.style.display = inputs.useRegex ? 'block' : 'none';
        }

        updateNumberPreview();
        currentPresetName = name;
        showToast(t('presetLoaded', { name }), 'success');
        loadPresetsList();
    } catch (e) {
        showToast(t('loadPresetFailed', { error: e.message }), 'error');
    }
}

async function deletePreset(name) {
    showModal(t('deletePreset'), t('deletePreset') + ' "' + name + '"?', async () => {
        try {
            const result = await window.pywebview.api.delete_preset(name);
            if (result.success) {
                showToast(t('presetDeleted'), 'info');
                loadPresetsList();
                updatePresetDropdownList();
            } else {
                showToast(result.error || t('deletePresetFailed', { error: '' }), 'error');
            }
        } catch (e) {
            showToast(t('deletePresetFailed', { error: e.message }), 'error');
        }
    });
}

function positionPresetDropdown() {
    const dd = document.getElementById('presetDropdown');
    const btn = document.getElementById('presetBtn');
    if (!dd || !btn) return;
    const br = btn.getBoundingClientRect();
    const ddWidth = dd.offsetWidth || 280;
    const margin = 8;
    let left = br.right - ddWidth;
    const minLeft = margin;
    const maxLeft = window.innerWidth - ddWidth - margin;
    if (left < minLeft) left = minLeft;
    if (left > maxLeft) left = maxLeft;
    dd.style.left = left + 'px';
    dd.style.right = 'auto';
    dd.style.top = (br.bottom + 6) + 'px';
}

function togglePresetDropdown() {
    const dd = document.getElementById('presetDropdown');
    if (dd.style.display === 'none' || !dd.style.display) {
        dd.style.display = 'block';
        positionPresetDropdown();
        loadPresetsList();
        updatePresetDropdownList();
    } else {
        closePresetDropdown();
    }
}

window.addEventListener('resize', () => {
    const dd = document.getElementById('presetDropdown');
    if (dd && dd.style.display === 'block') positionPresetDropdown();
});

function closePresetDropdown() {
    document.getElementById('presetDropdown').style.display = 'none';
}

function updatePresetDropdownList() {
    const body = document.getElementById('presetDropdownBody');
    if (!body) return;
    
    window.pywebview.api.list_presets().then(result => {
        if (!result.presets || result.presets.length === 0) {
            body.innerHTML = '<div class="presets-empty">' + t('noSavedConfigs') + '</div>';
            return;
        }
        body.innerHTML = '';
        result.presets.forEach(p => {
            const item = document.createElement('button');
            item.className = 'drop-preset-item' + (p.name === currentPresetName ? ' active-preset' : '');
            item.innerHTML =
                '<span class="dp-name">' + escapeHtml(p.name) + '</span>' +
                '<span class="dp-load-label">' + t('loadPreset') + '</span>' +
                '<div class="dp-actions">' +
                    '<button class="drop-preset-btn del" onclick="event.stopPropagation(); deletePresetDirect(\'' + escapeHtml(p.name).replace(/'/g, "\\'") + '\');" title="' + escapeHtml(t('deletePreset')) + '">✕</button>' +
                '</div>';
            item.onclick = () => { loadPreset(p.name); closePresetDropdown(); };
            body.appendChild(item);
        });
    }).catch(() => {});
}

async function deletePresetDirect(name) {
    try {
        const result = await window.pywebview.api.delete_preset(name);
        if (result.success) {
            showToast(t('presetDeleted'), 'info');
            loadPresetsList();
            updatePresetDropdownList();
        } else {
            showToast(result.error || t('deletePresetFailed', { error: '' }), 'error');
        }
    } catch (e) {
        showToast(t('deletePresetFailed', { error: e.message }), 'error');
    }
}

document.addEventListener('click', (e) => {
    const dd = document.getElementById('presetDropdown');
    const btn = document.getElementById('presetBtn');
    if (dd && dd.style.display !== 'none' && !dd.contains(e.target) && !btn.contains(e.target)) {
        closePresetDropdown();
    }
});

document.getElementById('presetNameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); savePreset(); }
    if (e.key === 'Escape') { e.preventDefault(); closeSavePresetModal(); }
});

// ===== INIT =====
initCustomTitlebar();
initRuleDragDrop();
applyTheme(appTheme);
localizeStaticText();
updateNumberPreview();
if (window.pywebview?.api) {
    loadSettings();
} else {
    const checkPywebview = setInterval(() => {
        if (window.pywebview?.api) {
            clearInterval(checkPywebview);
            loadSettings();
        }
    }, 100);
}

// Regex toggle hint visibility
document.getElementById('regexChk').addEventListener('change', function() {
    const hint = document.getElementById('regexHint');
    if (hint) hint.style.display = this.checked ? 'block' : 'none';
});

// ===== SETTINGS PANEL =====
function toggleSettingsPanel() {
    const panel = document.getElementById('settingsPanel');
    if (panel) {
        panel.classList.toggle('open');
        if (panel.classList.contains('open')) {
            loadSettings();
        }
    }
}

function toggleSettingsSection(id) {
    const content = document.getElementById(id + 'Content');
    const header = content?.previousElementSibling;
    const chevron = header?.querySelector('.settings-chevron');
    if (content) {
        content.classList.toggle('open');
        if (chevron) chevron.style.transform = content.classList.contains('open') ? 'rotate(90deg)' : '';
    }
}

async function loadSettings() {
    try {
        const result = await window.pywebview.api.get_settings();
        console.log('Settings loaded:', result);
        if (!result.error && result) {
            applyTheme(result.theme || 'dark');
            applyLanguage(result.language || 'en');
            // Load text rule order
            if (result.textRuleOrder && Array.isArray(result.textRuleOrder)) {
                reorderTextRules(result.textRuleOrder);
            }
            // Load sidebar tab order
            if (result.sidebarTabOrder && Array.isArray(result.sidebarTabOrder)) {
                console.log('Restoring sidebar tab order:', result.sidebarTabOrder);
                reorderSidebarTabs(result.sidebarTabOrder);
            } else {
                console.log('No sidebarTabOrder found, using default');
                reorderSidebarTabs();
            }
        }
    } catch (e) {
        console.error('Failed to load settings:', e);
    }
}

function reorderSidebarTabs(order) {
    const container = document.querySelector('.sidebar-tabs');
    if (!container) {
        console.error('Sidebar tabs container not found!');
        return;
    }
    const allTabs = new Map();
    container.querySelectorAll('.stab[data-tab]').forEach(tab => {
        allTabs.set(tab.dataset.tab, tab);
        console.log('Found tab:', tab.dataset.tab);
    });
    
    const finalOrder = (order && Array.isArray(order) && order.length > 0) ? order : ['text', 'transform', 'number'];
    console.log('Reordering to:', finalOrder);
    document.querySelectorAll('.stab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.stab-panel').forEach(panel => panel.classList.remove('active'));
    
    container.innerHTML = '';
    finalOrder.forEach((tabName, index) => {
        const tab = allTabs.get(tabName);
        if (tab) {
            container.appendChild(tab);
            console.log('Appended tab:', tabName);
            if (index === 0) {
                switchRuleTab(tabName);
            }
        } else {
            console.warn('Tab not found:', tabName);
        }
    });
    
    console.log('Final order:', Array.from(container.querySelectorAll('.stab[data-tab]')).map(t => t.dataset.tab));
}

function reorderTextRules(order) {
    const tab = document.getElementById('textTab');
    if (!tab) return;
    const groups = Array.from(tab.querySelectorAll('.rule-group-item'));
    order.forEach(ruleName => {
        const group = groups.find(g => {
            const btn = g.querySelector('.rtoggle');
            return btn && btn.getAttribute('onclick')?.includes(ruleName);
        });
        if (group) tab.appendChild(group);
    });
}

