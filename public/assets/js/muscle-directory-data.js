export var muscleGroupOrder = [
    "Head and neck", "Deep neck flexors", "Splenius muscles", "Capitis muscles", "Cervicis muscles", "Hyoid muscles", "Scalenes", "Suboccipital muscles", "Anterior neck", "Lateral neck", "Shoulder girdle", "Chest", "Upper back", "Shoulder", "Rotator cuff",
    "Upper arm", "Forearm", "Hand", "Thorax", "Posterior thorax", "Abdomen", "Back", "Erector spinae", "Deep back",
    "Pelvic floor",
    "Hip and pelvis", "Deep hip rotators", "Anterior thigh", "Medial thigh", "Posterior thigh",
    "Anterior lower leg", "Lateral lower leg", "Posterior lower leg", "Foot"
  ];

export var collectiveNeckGroupImages = {
    "Deep neck flexors": {
      imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Gray378.png",
      imageAlt: "Deep anterior neck anatomy plate showing the prevertebral muscle layer",
      label: "Regional group reference",
      focused: false
    },
    "Splenius muscles": {
      imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Musculus_splenius_capitis_marked.png",
      imageAlt: "Posterior anatomy illustration highlighting the splenius layer",
      label: "Splenius region reference",
      focused: false
    },
    "Capitis muscles": {
      imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Semispinalis.png",
      imageAlt: "Posterior neck anatomy plate providing regional context for capitis divisions",
      label: "Regional group reference",
      focused: false
    },
    "Cervicis muscles": {
      imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/1117_Muscles_of_the_Back.png",
      imageAlt: "Posterior neck and upper-back anatomy plate providing regional context for cervicis divisions",
      label: "Regional group reference",
      focused: false
    },
    "Hyoid muscles": {
      imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/1110_Muscle_of_the_Anterior_Neck.jpg",
      imageAlt: "Anterior neck anatomy plate identifying the suprahyoid and infrahyoid muscles",
      label: "Hyoid group reference",
      focused: true
    },
    "Scalenes": {
      imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Scalenus_anterior_-_animation04.gif",
      imageAlt: "Lateral neck anatomy reference showing the scalene region",
      label: "Scalene region reference",
      focused: false
    },
    "Suboccipital muscles": {
      imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Suboccipital_muscles01.png",
      imageAlt: "Posterior anatomy illustration identifying the four suboccipital muscles",
      label: "Highlighted muscle group",
      focused: true
    }
  };

export var movementTagOrder = [
    "Neck flexor", "Neck extensor", "Neck lateral flexor", "Neck rotator",
    "Shoulder flexor", "Shoulder extensor", "Shoulder abductor", "Shoulder adductor", "Shoulder internal rotator", "Shoulder external rotator",
    "Scapular protractor", "Scapular retractor", "Scapular elevator", "Scapular depressor", "Scapular upward rotator", "Scapular downward rotator",
    "Elbow flexor", "Elbow extensor", "Forearm pronator", "Forearm supinator", "Wrist flexor", "Wrist extensor",
    "Finger flexor", "Finger extensor", "Finger abductor", "Finger adductor", "Thumb flexor", "Thumb extensor", "Thumb abductor", "Thumb adductor", "Thumb opposer",
    "Trunk flexor", "Trunk extensor", "Trunk rotator", "Trunk lateral flexor", "Inspiratory muscle", "Expiratory muscle",
    "Pelvic floor supporter", "Urinary continence muscle", "Fecal continence muscle",
    "Hip flexor", "Hip extensor", "Hip abductor", "Hip adductor", "Hip internal rotator", "Hip external rotator",
    "Knee flexor", "Knee extensor", "Knee internal rotator", "Knee external rotator",
    "Ankle dorsiflexor", "Ankle plantarflexor", "Foot invertor", "Foot evertor", "Toe flexor", "Toe extensor"
  ];

export function muscleSectionGroup(item) {
    if (item && item.group === "Deep hip") return "Deep hip rotators";
    // Navigation umbrella only: preserve the original anatomical subgroup in data/detail.
    if (["Pelvic diaphragm", "Superficial perineum", "Deep perineum", "Pelvic sphincters"].indexOf(item && item.group) !== -1) return "Pelvic floor";
    var title = String(item && item.title || "").toLowerCase();
    var family = String(item && item.family || "").toLowerCase();
    if (/rectus capitis posterior|obliquus capitis/.test(title)) return "Suboccipital muscles";
    if (title.indexOf("scalene") !== -1) return "Scalenes";
    if (family === "suprahyoid muscles" || family === "infrahyoid muscles") return "Hyoid muscles";
    if (title.indexOf("capitis") !== -1) return "Capitis muscles";
    return String(item && item.group || "Other");
  }

export function neckDirectoryGroups(item) {
    var title = String(item && item.title || "").toLowerCase();
    var family = String(item && item.family || "").toLowerCase();
    var groups = [];
    if (title === "levator scapulae") groups.push("Upper back");
    if (family === "prevertebral muscles" || ["longus colli", "longus capitis", "rectus capitis anterior", "rectus capitis lateralis"].indexOf(title) !== -1) groups.push("Deep neck flexors");
    if (family === "splenius" || title.indexOf("splenius ") === 0) groups.push("Splenius muscles");
    if (title.indexOf("capitis") !== -1) groups.push("Capitis muscles");
    if (title.indexOf("cervicis") !== -1) groups.push("Cervicis muscles");
    var sectionGroup = muscleSectionGroup(item);
    if (groups.indexOf(sectionGroup) === -1) groups.push(sectionGroup);
    return groups;
  }

export function muscleRegion(item) {
    var bodyMap = item && item.bodyMap;
    var title = String(item && item.title || "").toLowerCase();
    var group = String(item && item.group || "").toLowerCase();
    if (/\b(cervicis|capitis)\b/.test(title)) return "head-neck";
    if (["head and neck", "anterior neck", "lateral neck", "suboccipital neck"].indexOf(group) !== -1) return "head-neck";
    if (["shoulder", "shoulder girdle", "upper back", "chest", "rotator cuff"].indexOf(group) !== -1) return "shoulder-scapula";
    if (["upper arm", "forearm"].indexOf(group) !== -1) return "elbow-forearm";
    if (group === "hand") return "wrist-hand";
    if (["thorax", "posterior thorax"].indexOf(group) !== -1 || /thoracis|thoracic|costarum/.test(title)) return "thoracic-spine";
    if (["abdomen", "back", "erector spinae", "deep back"].indexOf(group) !== -1) return "lumbar-spine";
    if (["pelvic diaphragm", "superficial perineum", "deep perineum", "pelvic sphincters", "hip and pelvis", "deep hip", "medial thigh"].indexOf(group) !== -1) return "pelvis-hip";
    if (["anterior thigh", "posterior thigh"].indexOf(group) !== -1 || title === "popliteus") return "knee";
    if (["anterior lower leg", "lateral lower leg", "posterior lower leg", "foot"].indexOf(group) !== -1) return "foot-ankle";
    if (bodyMap === "head-neck") return "head-neck";
    if (["shoulder", "chest"].indexOf(bodyMap) !== -1) return "shoulder-scapula";
    if (["upper-arm-front", "upper-arm-back", "forearm"].indexOf(bodyMap) !== -1) return "elbow-forearm";
    if (["abdomen", "back"].indexOf(bodyMap) !== -1) return "lumbar-spine";
    if (["hip-front", "hip-back"].indexOf(bodyMap) !== -1) return "pelvis-hip";
    if (["thigh-front", "thigh-back"].indexOf(bodyMap) !== -1) return "knee";
    if (["lower-leg-front", "lower-leg-back", "foot"].indexOf(bodyMap) !== -1) return "foot-ankle";
    return "other";
  }

export function muscleInRegion(item, region) {
    if (region === "shoulder-arm") return ["shoulder-scapula", "elbow-forearm", "wrist-hand"].some(function (part) { return muscleInRegion(item, part); });
    if (region === "spine-rib-cage") return ["thoracic-spine", "lumbar-spine"].some(function (part) { return muscleInRegion(item, part); });
    if (muscleRegion(item) === region) return true;
    var title = String(item && item.title || "").toLowerCase();
    if (region === "head-neck" && title === "upper trapezius") return true;
    var rolePrefixes = {
      "head-neck": ["Neck "],
      "shoulder-scapula": ["Shoulder ", "Scapular "],
      "elbow-forearm": ["Elbow ", "Forearm "],
      "wrist-hand": ["Wrist ", "Finger ", "Thumb "],
      "thoracic-spine": ["Trunk ", "Inspiratory ", "Expiratory "],
      "lumbar-spine": ["Trunk "],
      "pelvis-hip": ["Hip ", "Pelvic ", "Urinary ", "Fecal "],
      knee: ["Knee "],
      "foot-ankle": ["Ankle ", "Foot ", "Toe "]
    };
    var prefixes = rolePrefixes[region] || [];
    return muscleFunctionalRoles(item).some(function (role) {
      return prefixes.some(function (prefix) { return role.indexOf(prefix) === 0; });
    });
  }

export function muscleFunctionalRoles(item) {
    if (!item) return [];
    if (Array.isArray(item.functionalRoles)) {
      return movementTagOrder.filter(function (role) { return item.functionalRoles.indexOf(role) !== -1; });
    }
    var actions = String(item.actions || item.function || "").toLowerCase();
    var region = muscleRegion(item);
    var roles = [];
    function add(label, pattern) {
      if (pattern.test(actions)) roles.push(label);
    }
    if (region === "head-neck") {
      add("Neck flexor", /bilaterally flexes the neck|^flexes and laterally flexes the neck|^flexes (?:and stabilizes )?the cervical spine|^flexes the head|neck flexion/);
      add("Neck extensor", /extends? the (?:head and )?neck|neck extension|extends? the head/);
      add("Neck lateral flexor", /laterally flexes? (?:the head|the neck|the cervical vertebral column|it|to the)/);
      add("Neck rotator", /rotates? (?:and [^.;]+ )?(?:the head|the atlas)|rotates? or laterally flexes it|neck rotation/);
    }
    add("Shoulder internal rotator", /medial(?:ly)? rotat(?:es|ion).*(?:arm|shoulder)|internal rotation (?:of|at) the shoulder/);
    add("Shoulder external rotator", /lateral(?:ly)? rotat(?:es|ion).*(?:arm|shoulder)|external rotation (?:of|at) the shoulder/);
    add("Shoulder flexor", /shoulder flexion|flexes? (?:and adducts? )?the arm at the shoulder|anterior fibers assist flexion/);
    add("Shoulder extensor", /shoulder extension|extends?(?:, [^.;]+)* the arm|posterior fibers assist extension/);
    add("Shoulder abductor", /abducts? the arm|arm abduction/);
    add("Shoulder adductor", /adducts?(?:, [^.;]+)* the arm|shoulder adduction/);
    add("Scapular protractor", /protracts? the scapula/);
    add("Scapular retractor", /retracts? (?:and [^.;]+ )?the scapula|scapular retraction/);
    add("Scapular elevator", /elevates? (?:and [^.;]+ )?the scapula|scapular elevation/);
    add("Scapular depressor", /depresses? (?:and [^.;]+ )?the scapula|scapular depression/);
    add("Scapular upward rotator", /upward(?:ly)? rotat(?:es|ion)/);
    add("Scapular downward rotator", /downward(?:ly)? rotat(?:es|ion)/);
    add("Elbow flexor", /flexes? the elbow|elbow flexor|elbow flexion/);
    add("Elbow extensor", /extends? the elbow|elbow extension/);
    add("Forearm pronator", /pronates? the forearm/);
    add("Forearm supinator", /supinates? the forearm/);
    add("Wrist flexor", /flexes? (?:and [^.;]+ )?(?:the hand at )?the wrist|wrist flexion/);
    add("Wrist extensor", /extends? (?:and [^.;]+ )?(?:the hand at )?the wrist|wrist extension/);
    if (region === "elbow-forearm" || region === "wrist-hand") {
      add("Finger flexor", /flex(?:es|ion) (?:the )?(?:little )?finger|flexes? the (?:proximal|distal) interphalangeal|flexes? [^.;]*fingers|flex the metacarpophalangeal|finger flexion/);
      add("Finger extensor", /extends? (?:the )?(?:little|index)? ?finger|extends? digits|extending the interphalangeal|finger extension/);
      add("Finger abductor", /abducts? (?:the )?(?:little finger|digits?)/);
      add("Finger adductor", /adducts? (?:the )?(?:fingers?|digits?)/);
      add("Thumb flexor", /flexes? the thumb/);
      add("Thumb extensor", /extends? the thumb/);
      add("Thumb abductor", /abducts? (?:and [^.;]+ )?the thumb/);
      add("Thumb adductor", /adducts? the thumb/);
      add("Thumb opposer", /opposes? the thumb|assists? opposition/);
    }
    if (region === "thoracic-spine" || region === "lumbar-spine") {
      add("Trunk flexor", /flexes? (?:and [^.;]+ )?(?:the |lumbar )?trunk|trunk flexion/);
      add("Trunk extensor", /extends? (?:and [^.;]+ )?(?:the |lumbar )?trunk|extends? [^.;]*(?:vertebral column|spine)|trunk extension/);
      add("Trunk rotator", /rotates? the trunk|trunk rotation/);
      add("Trunk lateral flexor", /laterally flexes? (?:the |lumbar )?trunk|lateral trunk flexion/);
      add("Inspiratory muscle", /inspiration|elevates? (?:the )?(?:first|second|upper)? ?ribs?|expansion of the thoracic cavity/);
      add("Expiratory muscle", /expiration|depresses? (?:the )?(?:lower )?ribs?/);
    }
    add("Hip flexor", /flexes? the (?:hip|thigh)|hip flexion|assists? flexion of the hip/);
    add("Hip extensor", /extends? the (?:hip|thigh)|hip extension|assists? extension of the hip/);
    add("Hip internal rotator", /medial(?:ly)? rotat(?:es|ion).*(?:hip|thigh)|anterior fibers assist medial rotation|hip flexion and medial rotation|medial rotation at the hip/);
    add("Hip external rotator", /lateral(?:ly)? rotat(?:es|ion).*(?:hip|thigh)|external rotation (?:of|at) the hip/);
    add("Hip abductor", /abducts?(?:, [^.;]+)* (?:the )?(?:hip|thigh)|hip abduction/);
    add("Hip adductor", /adducts?(?:, [^.;]+)* (?:the )?(?:hip|thigh)|assists? adduction of the thigh|hip adduction/);
    add("Knee flexor", /flexes? (?:and [^.;]+ )?(?:the )?knee|knee flexion/);
    add("Knee extensor", /extends? (?:the leg at )?the knee|extends? the knee|knee extension/);
    add("Knee internal rotator", /medial(?:ly)? rotat(?:es|ing) the (?:flexed )?(?:knee|leg|tibia)/);
    add("Knee external rotator", /lateral(?:ly)? rotat(?:es|ing) the (?:flexed )?(?:knee|leg|tibia)/);
    if (region === "foot-ankle") {
      add("Ankle dorsiflexor", /dorsiflex(?:es|ion)/);
      add("Ankle plantarflexor", /plantarflex(?:es|ion)/);
      add("Foot invertor", /inverts? the foot|foot inversion|assists? inversion/);
      add("Foot evertor", /everts? (?:and [^.;]+ )?the foot|foot eversion/);
      add("Toe flexor", /flex(?:es|ing) (?:the )?(?:great|little|lateral four|toes?)/);
      add("Toe extensor", /extends? (?:the )?(?:great|little|lateral four|toes?|digits?)|extension of toes/);
    }
    add("Pelvic floor supporter", /supports? (?:and elevates? )?(?:the )?pelvic|pelvic support|supports? the central pelvic outlet|stabilizes? the perineal body/);
    add("Urinary continence muscle", /urinary continence|compresses? the urethra|constricts? the urethral/);
    add("Fecal continence muscle", /fecal continence|closes? the anal canal|anorectal angle/);
    return roles;
  }

export function orderedMuscleGroups(items) {
    var groupNames = Array.from(new Set(items.map(muscleSectionGroup)));
    groupNames.sort(function (a, b) {
      var aIndex = muscleGroupOrder.indexOf(a);
      var bIndex = muscleGroupOrder.indexOf(b);
      if (aIndex === -1) aIndex = muscleGroupOrder.length;
      if (bIndex === -1) bIndex = muscleGroupOrder.length;
      return aIndex === bIndex ? a.localeCompare(b) : aIndex - bIndex;
    });
    return groupNames;
  }
