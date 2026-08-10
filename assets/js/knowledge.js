(function () {
  "use strict";

  var grid = document.getElementById("knowledgeGrid");
  var status = document.getElementById("knowledgeStatus");
  var search = document.getElementById("knowledgeSearch");
  var detail = document.getElementById("knowledgeDetail");
  var detailContent = document.getElementById("knowledgeDetailContent");
  var directory = document.querySelector(".knowledge-directory");
  var filterButtons = Array.from(document.querySelectorAll("[data-knowledge-filter]"));
  var muscleTools = document.getElementById("muscleTools");
  var muscleDirectoryControls = document.getElementById("muscleDirectoryControls");
  var muscleActionBrowser = document.querySelector(".muscle-action-browser");
  var recipeTools = document.getElementById("recipeTools");
  var carePathTools = document.getElementById("carePathTools");
  var muscleAtlas = document.getElementById("muscleAtlas");
  var atlasGrid = document.getElementById("atlasGrid");
  var knowledgePaths = document.getElementById("knowledgePaths");
  var muscleRegionButtons = Array.from(document.querySelectorAll("[data-muscle-region]"));
  var muscleGroupFilterShell = document.getElementById("muscleGroupFilterShell");
  var muscleGroupFilters = document.getElementById("muscleGroupFilters");
  var muscleActionSections = document.getElementById("muscleActionSections");
  var muscleActionTitle = document.getElementById("muscleActionTitle");
  var muscleSelectionRegion = document.getElementById("muscleSelectionRegion");
  var muscleSelectionAction = document.getElementById("muscleSelectionAction");
  var muscleAtlasTitle = document.getElementById("muscleAtlasTitle");
  var muscleFunction = document.getElementById("muscleFunction");
  var muscleVisual = document.getElementById("muscleVisual");
  var muscleSort = document.getElementById("muscleSort");
  var muscleReset = document.getElementById("muscleReset");
  var recipeRegionButtons = Array.from(document.querySelectorAll("[data-recipe-region]"));
  var carePathButtons = Array.from(document.querySelectorAll("[data-care-path]"));
  var activeType = "all";
  var activeMuscleRegion = "all";
  var activeMuscleGroup = "all";
  var activeMuscleFunction = "all";
  var activeMuscleVisual = "all";
  var activeRecipeRegion = "all";
  var activeCarePath = "all";
  var data = { conditions: [], muscles: [], recipes: [] };
  var videos = [];

  function normalizedAnatomyName(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  function hasFocusedMuscleImage(item) {
    if (!item || !item.title || !item.imageAlt) return false;
    var title = normalizedAnatomyName(String(item.title).replace(/\([^)]*\)/g, ""));
    var description = normalizedAnatomyName(item.imageAlt);
    var titleWords = title.split(" ").filter(function (word) { return word.length > 3; });
    var namesMuscle = description.indexOf(title) !== -1 || (titleWords.length > 0 && titleWords.every(function (word) {
      return description.indexOf(word) !== -1;
    }));
    var describesFocusedReference = /highlight|focus|depict|render|color coding|identif|anatomical illustration|anatomy plate|line illustration/.test(description);
    return Boolean(title) && namesMuscle && describesFocusedReference;
  }

  function muscleImageLabel(item) {
    return hasFocusedMuscleImage(item)
      ? "Highlighted · " + item.title
      : "Regional reference · locate " + item.title;
  }

  function muscleVisualType(item) {
    return hasFocusedMuscleImage(item) ? "focused" : "regional";
  }

  var muscleRegions = {
    "head-neck": { title: "Neck", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/1117_Muscles_of_the_Back.png", imageAlt: "OpenStax anatomy plate of the neck and upper back", credit: "OpenStax College · CC BY 3.0", creditUrl: "https://commons.wikimedia.org/wiki/File:1117_Muscles_of_the_Back.png" },
    "shoulder-scapula": { title: "Shoulder & Scapula", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Arm_shoulder_gray.png", imageAlt: "Gray's Anatomy plate of shoulder, scapular, and chest muscles", credit: "Gray's Anatomy · public domain", creditUrl: "https://commons.wikimedia.org/wiki/File:Arm_shoulder_gray.png" },
    "elbow-forearm": { title: "Elbow & Forearm", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/1120_Muscles_that_Move_the_Forearm.jpg", imageAlt: "OpenStax anatomy plate of muscles that move the elbow and forearm", credit: "OpenStax · CC BY 4.0", creditUrl: "https://commons.wikimedia.org/wiki/File:1120_Muscles_that_Move_the_Forearm.jpg" },
    "wrist-hand": { title: "Wrist & Hand", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/1121_Intrinsic_Muscles_of_the_Hand.jpg", imageAlt: "OpenStax anatomy plate of intrinsic hand muscles", credit: "OpenStax · CC BY 4.0", creditUrl: "https://commons.wikimedia.org/wiki/File:1121_Intrinsic_Muscles_of_the_Hand.jpg" },
    "thoracic-spine": { title: "Thoracic Spine", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/1117_Muscles_of_the_Back.png", imageAlt: "OpenStax plate of thoracic, rib, and posterior trunk muscles", credit: "OpenStax College · CC BY 3.0", creditUrl: "https://commons.wikimedia.org/wiki/File:1117_Muscles_of_the_Back.png" },
    "lumbar-spine": { title: "Lumbar Spine", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Gray398.png", imageAlt: "Gray's Anatomy plate of abdominal and lumbar trunk muscles", credit: "Gray's Anatomy, plate 398 · public domain", creditUrl: "https://commons.wikimedia.org/wiki/File:Gray398.png" },
    "pelvis-hip": { title: "Pelvis & Hip", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/1918_edition_of_Gray%27s_Anatomy_of_the_Human_Body%2C_fig_430.png", imageAlt: "Gray's Anatomy plate of pelvic and hip muscles", credit: "Gray's Anatomy, figure 430 · public domain", creditUrl: "https://commons.wikimedia.org/wiki/File:1918_edition_of_Gray%27s_Anatomy_of_the_Human_Body%2C_fig_430.png" },
    knee: { title: "Knee", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Rectus_femoris.png", imageAlt: "Anatomy plate of a major knee extensor and the anterior thigh", credit: "Wikimedia Commons anatomy plate", creditUrl: "https://commons.wikimedia.org/wiki/File:Rectus_femoris.png" },
    "foot-ankle": { title: "Foot & Ankle", imageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/1124_Intrinsic_Muscles_of_the_Foot_a.png", imageAlt: "OpenStax plate of foot and ankle muscles", credit: "OpenStax College · CC BY 3.0", creditUrl: "https://commons.wikimedia.org/wiki/File:1124_Intrinsic_Muscles_of_the_Foot_a.png" }
  };
  var muscleRegionSections = [
    { title: "Upper quarter", description: "Cervical, shoulder, arm, forearm, wrist, and hand anatomy.", regions: ["head-neck", "shoulder-scapula", "elbow-forearm", "wrist-hand"] },
    { title: "Trunk", description: "Thoracic, rib, respiratory, abdominal, and lumbar contributors.", regions: ["thoracic-spine", "lumbar-spine"] },
    { title: "Lower quarter", description: "Pelvic floor, hip, thigh, knee, lower-leg, ankle, and foot anatomy.", regions: ["pelvis-hip", "knee", "foot-ankle"] }
  ];
  var muscleGroupOrder = [
    "Head and neck", "Deep neck flexors", "Splenius muscles", "Capitis muscles", "Cervicis muscles", "Hyoid muscles", "Scalenes", "Suboccipital muscles", "Anterior neck", "Lateral neck", "Shoulder girdle", "Chest", "Upper back", "Shoulder", "Rotator cuff",
    "Upper arm", "Forearm", "Hand", "Thorax", "Posterior thorax", "Abdomen", "Back", "Erector spinae", "Deep back",
    "Pelvic diaphragm", "Superficial perineum", "Deep perineum", "Pelvic sphincters",
    "Hip and pelvis", "Deep hip", "Anterior thigh", "Medial thigh", "Posterior thigh",
    "Anterior lower leg", "Lateral lower leg", "Posterior lower leg", "Foot"
  ];
  var collectiveNeckGroups = ["Deep neck flexors", "Splenius muscles", "Capitis muscles", "Cervicis muscles", "Hyoid muscles", "Scalenes", "Suboccipital muscles"];
  var collectiveNeckGroupDescriptions = {
    "Deep neck flexors": "The four prevertebral muscles that provide deep anterior head-and-neck flexion and segmental control.",
    "Splenius muscles": "Splenius capitis and splenius cervicis, the two named muscles in the splenius layer.",
    "Capitis muscles": "Muscles named for their attachment to the head, organized by anatomical family.",
    "Cervicis muscles": "Muscles with a cervicis division associated with the cervical region, kept within their true anatomical families.",
    "Hyoid muscles": "The suprahyoid and infrahyoid muscles that position the hyoid during swallowing and jaw movement.",
    Scalenes: "Anterior, middle, and posterior scalenes considered as a functional neck group.",
    "Suboccipital muscles": "Four small deep muscles commonly referenced together at the upper cervical spine."
  };
  var collectiveNeckGroupImages = {
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
  var muscleFamilyOrder = [
    "Superficial neck", "Splenius", "Prevertebral muscles", "Suprahyoid muscles", "Infrahyoid muscles",
    "Semispinalis", "Longissimus", "Iliocostalis", "Spinalis", "Scalenes", "Suboccipital muscles",
    "Transversospinalis", "Interspinales", "Intertransversarii", "Rotatores", "Levatores costarum",
    "Anterior abdominal wall", "Posterior abdominal wall", "Hypothenar muscles", "Hip adductors", "Inguinal muscles"
  ];

  var labels = { conditions: "Movement pattern", muscles: "Muscle dictionary", recipes: "Correction recipe" };
  var primaryTypes = ["conditions", "muscles"];
  var carePaths = {
    "postural-movement": {
      label: "Posture patterns",
      description: "Non-acute education for posture, comfort, coordination, mobility, and load control. It does not diagnose a body part as structurally misaligned."
    },
    "musculoskeletal-condition": {
      label: "Musculoskeletal conditions & injuries",
      description: "A cautious pathway for sprains, dislocations, disc-related conditions, and nerve-related syndromes. Some conditions require assessment before exercise is appropriate."
    }
  };

  function carePath(item) {
    return item && carePaths[item.pathway] ? item.pathway : "postural-movement";
  }

  function contentLabel(type, item) {
    if (type === "muscles") return labels[type];
    if (type === "conditions" && carePath(item) === "postural-movement" && item.postureCategory) return item.postureCategory;
    if (type === "conditions" && carePath(item) === "musculoskeletal-condition" && item.conditionCategory) return item.conditionCategory;
    return carePaths[carePath(item)].label;
  }
  var summaries = {
    conditions: function (item) { return item.summary || item.screening || "Explore this movement pattern."; },
    muscles: function (item) { return item.actions || item.function || "Explore this muscle's role in movement."; },
    recipes: function (item) { return item.goal || "Use a focused sequence, then reassess before progressing."; }
  };
  var fields = {
    conditions: [["joints", "Areas involved"], ["tags", "Common associations"], ["tightMuscles", "Often overactive or restricted"], ["weakMuscles", "Often underactive"], ["screening", "Movement screen"]],
    muscles: [["group", "Anatomical group"], ["family", "Muscle family"], ["origin", "Origin"], ["insertion", "Insertion"]],
    recipes: [["bodyRegion", "Body area"], ["goal", "Goal"], ["whenToUse", "A useful starting point when"], ["equipment", "What you may need"], ["steps", "Starting sequence"], ["dosage", "Suggested dose"], ["reassess", "Reassess before progressing"], ["regression", "Make it easier"], ["progression", "Make it harder"], ["cautions", "Stop and get help when"], ["relatedConditions", "Related movement patterns"]]
  };

  var movementTagOrder = [
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
  var movementRoleSections = [
    { title: "Neck", regions: ["head-neck"], roles: ["Neck flexor", "Neck extensor", "Neck lateral flexor", "Neck rotator"] },
    { title: "Shoulder", regions: ["shoulder-scapula"], roles: ["Shoulder flexor", "Shoulder extensor", "Shoulder abductor", "Shoulder adductor", "Shoulder internal rotator", "Shoulder external rotator"] },
    { title: "Scapula", regions: ["shoulder-scapula"], roles: ["Scapular protractor", "Scapular retractor", "Scapular elevator", "Scapular depressor", "Scapular upward rotator", "Scapular downward rotator"] },
    { title: "Elbow & forearm", regions: ["elbow-forearm"], roles: ["Elbow flexor", "Elbow extensor", "Forearm pronator", "Forearm supinator"] },
    { title: "Wrist & hand", regions: ["elbow-forearm", "wrist-hand"], roles: ["Wrist flexor", "Wrist extensor", "Finger flexor", "Finger extensor", "Finger abductor", "Finger adductor", "Thumb flexor", "Thumb extensor", "Thumb abductor", "Thumb adductor", "Thumb opposer"] },
    { title: "Trunk & breathing", regions: ["thoracic-spine", "lumbar-spine"], roles: ["Trunk flexor", "Trunk extensor", "Trunk rotator", "Trunk lateral flexor", "Inspiratory muscle", "Expiratory muscle"] },
    { title: "Hip", regions: ["pelvis-hip", "knee"], roles: ["Hip flexor", "Hip extensor", "Hip abductor", "Hip adductor", "Hip internal rotator", "Hip external rotator"] },
    { title: "Pelvic floor", regions: ["pelvis-hip"], roles: ["Pelvic floor supporter", "Urinary continence muscle", "Fecal continence muscle"] },
    { title: "Knee", regions: ["knee"], roles: ["Knee flexor", "Knee extensor", "Knee internal rotator", "Knee external rotator"] },
    { title: "Ankle & foot", regions: ["foot-ankle"], roles: ["Ankle dorsiflexor", "Ankle plantarflexor", "Foot invertor", "Foot evertor", "Toe flexor", "Toe extensor"] }
  ];
  var antagonistRolePairs = [
    ["Neck flexor", "Neck extensor"],
    ["Shoulder flexor", "Shoulder extensor"], ["Shoulder abductor", "Shoulder adductor"], ["Shoulder internal rotator", "Shoulder external rotator"],
    ["Scapular protractor", "Scapular retractor"], ["Scapular elevator", "Scapular depressor"], ["Scapular upward rotator", "Scapular downward rotator"],
    ["Elbow flexor", "Elbow extensor"], ["Forearm pronator", "Forearm supinator"], ["Wrist flexor", "Wrist extensor"],
    ["Finger flexor", "Finger extensor"], ["Finger abductor", "Finger adductor"], ["Thumb flexor", "Thumb extensor"], ["Thumb abductor", "Thumb adductor"],
    ["Trunk flexor", "Trunk extensor"], ["Inspiratory muscle", "Expiratory muscle"],
    ["Hip flexor", "Hip extensor"], ["Hip abductor", "Hip adductor"], ["Hip internal rotator", "Hip external rotator"],
    ["Knee flexor", "Knee extensor"], ["Knee internal rotator", "Knee external rotator"],
    ["Ankle dorsiflexor", "Ankle plantarflexor"], ["Foot invertor", "Foot evertor"], ["Toe flexor", "Toe extensor"]
  ];

  function movementTagId(role) {
    var index = movementTagOrder.indexOf(role);
    return index === -1 ? "F-000" : "F-" + String(index + 1).padStart(3, "0");
  }

  function antagonistRolesFor(roles) {
    var opposites = [];
    antagonistRolePairs.forEach(function (pair) {
      if (roles.indexOf(pair[0]) !== -1) opposites.push(pair[1]);
      if (roles.indexOf(pair[1]) !== -1) opposites.push(pair[0]);
    });
    return Array.from(new Set(opposites));
  }

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function muscleSectionGroup(item) {
    var title = String(item && item.title || "").toLowerCase();
    var family = String(item && item.family || "").toLowerCase();
    if (/rectus capitis posterior|obliquus capitis/.test(title)) return "Suboccipital muscles";
    if (title.indexOf("scalene") !== -1) return "Scalenes";
    if (family === "suprahyoid muscles" || family === "infrahyoid muscles") return "Hyoid muscles";
    if (title.indexOf("capitis") !== -1) return "Capitis muscles";
    return String(item && item.group || "Other");
  }

  function neckDirectoryGroups(item) {
    var title = String(item && item.title || "").toLowerCase();
    var family = String(item && item.family || "").toLowerCase();
    var groups = [];
    if (family === "prevertebral muscles" || ["longus colli", "longus capitis", "rectus capitis anterior", "rectus capitis lateralis"].indexOf(title) !== -1) groups.push("Deep neck flexors");
    if (family === "splenius" || title.indexOf("splenius ") === 0) groups.push("Splenius muscles");
    if (title.indexOf("capitis") !== -1) groups.push("Capitis muscles");
    if (title.indexOf("cervicis") !== -1) groups.push("Cervicis muscles");
    var sectionGroup = muscleSectionGroup(item);
    if (groups.indexOf(sectionGroup) === -1) groups.push(sectionGroup);
    return groups;
  }

  function neckDirectoryGroup(item) {
    return neckDirectoryGroups(item)[0];
  }

  function muscleFamily(item) {
    var sectionGroup = muscleSectionGroup(item).toLowerCase();
    function distinctFamily(value) {
      var familyName = String(value || "").trim();
      return familyName.toLowerCase() === sectionGroup ? "" : familyName;
    }
    var explicitFamily = String(item && item.family || "").trim();
    if (explicitFamily) return distinctFamily(explicitFamily);
    var title = String(item && item.title || "").toLowerCase();
    var families = [
      ["splenius ", "Splenius"], ["semispinalis ", "Semispinalis"], ["longissimus ", "Longissimus"],
      ["iliocostalis ", "Iliocostalis"], ["spinalis ", "Spinalis"], ["scalene", "Scalenes"]
    ];
    for (var index = 0; index < families.length; index += 1) {
      if (title.indexOf(families[index][0]) === 0 || title.indexOf(" " + families[index][0]) !== -1) return distinctFamily(families[index][1]);
    }
    if (["longus colli", "longus capitis", "rectus capitis anterior", "rectus capitis lateralis"].indexOf(title) !== -1) return "Prevertebral muscles";
    if (["digastric", "stylohyoid", "mylohyoid", "geniohyoid"].indexOf(title) !== -1) return "Suprahyoid muscles";
    if (["sternohyoid", "omohyoid", "sternothyroid", "thyrohyoid"].indexOf(title) !== -1) return "Infrahyoid muscles";
    if (/rectus capitis posterior|obliquus capitis/.test(title)) return distinctFamily("Suboccipital muscles");
    return "";
  }

  function movementFamily(item, role) {
    var title = String(item && item.title || "").toLowerCase();
    var group = String(item && item.group || "").toLowerCase();
    var region = muscleRegion(item);
    var existingFamily = muscleFamily(item);
    var movementRole = String(role || "");

    if (/^Shoulder /.test(movementRole)) {
      if (/latissimus dorsi|teres major/.test(title)) return "Posterior shoulder movers";
      if (/pectoralis/.test(title)) return "Pectorals";
      if (/deltoid/.test(title)) return "Deltoid";
      if (group === "rotator cuff") return "Rotator cuff";
      if (/biceps brachii|coracobrachialis/.test(title)) return "Anterior arm muscles";
      if (/triceps brachii/.test(title)) return "Posterior arm muscles";
    }
    if (/^Hip /.test(movementRole)) {
      if (/rectus femoris|sartorius/.test(title)) return "Anterior thigh muscles";
      if (/biceps femoris|semitendinosus|semimembranosus/.test(title)) return "Hamstrings";
      if (/adductor|gracilis|pectineus/.test(title)) return "Hip adductors";
    }
    if (/^Knee /.test(movementRole)) {
      if (/rectus femoris|vastus |articularis genus/.test(title)) return "Quadriceps";
      if (/biceps femoris|semitendinosus|semimembranosus/.test(title)) return "Hamstrings";
      if (/sartorius|gracilis/.test(title)) return "Medial knee flexors";
      if (/gastrocnemius|plantaris/.test(title)) return "Calf-assisted knee flexors";
      if (/popliteus/.test(title)) return "Posterior knee rotators";
    }

    if (region === "head-neck") return existingFamily || muscleSectionGroup(item);

    if (region === "shoulder-scapula") {
      if (/trapezius/.test(title)) return "Trapezius";
      if (/rhomboid/.test(title)) return "Rhomboids";
      if (group === "rotator cuff") return "Rotator cuff";
      if (/pectoralis/.test(title)) return "Pectorals";
      if (/deltoid/.test(title)) return "Deltoid";
      if (/serratus anterior/.test(title)) return "Scapular protractors";
      if (/latissimus dorsi|teres major/.test(title)) return "Posterior shoulder movers";
      if (/subclavius/.test(title)) return "Clavicular stabilizers";
      return existingFamily || "Other shoulder muscles";
    }

    if (region === "elbow-forearm" || region === "wrist-hand") {
      if (/biceps brachii|brachialis|coracobrachialis/.test(title)) return "Anterior arm muscles";
      if (/triceps brachii|anconeus/.test(title)) return "Posterior arm muscles";
      if (/brachioradialis|extensor carpi radialis longus|extensor carpi radialis brevis/.test(title)) return "Lateral forearm muscles";
      if (/pronator teres|flexor carpi radialis|flexor carpi ulnaris|palmaris longus|flexor digitorum superficialis/.test(title)) return "Superficial flexor-pronator compartment";
      if (/flexor digitorum profundus|flexor pollicis longus|pronator quadratus/.test(title)) return "Deep flexor-pronator compartment";
      if (/extensor carpi ulnaris|extensor digitorum$|extensor digiti minimi/.test(title)) return "Superficial extensor compartment";
      if (/supinator|abductor pollicis longus|extensor pollicis|extensor indicis/.test(title)) return "Deep extensor-supinator compartment";
      if (/abductor pollicis brevis|opponens pollicis|flexor pollicis brevis|adductor pollicis/.test(title)) return "Thenar muscles";
      if (/abductor digiti minimi of the hand|flexor digiti minimi brevis of the hand|opponens digiti minimi|palmaris brevis/.test(title)) return "Hypothenar muscles";
      if (/lumbricals of the hand/.test(title)) return "Hand lumbricals";
      if (/interossei of the hand/.test(title)) return "Hand interossei";
      return existingFamily || "Other arm and hand muscles";
    }

    if (region === "thoracic-spine" || region === "lumbar-spine") {
      if (/rectus abdominis|oblique|transversus abdominis|pyramidalis/.test(title)) return "Abdominal wall";
      if (/iliocostalis|longissimus|spinalis/.test(title)) return "Erector spinae";
      if (/semispinalis|multifidus|rotatores/.test(title)) return "Transversospinalis muscles";
      if (/interspinales|intertransversarii/.test(title)) return "Segmental spinal stabilizers";
      if (/quadratus lumborum/.test(title)) return "Posterior abdominal wall";
      if (/diaphragm/.test(title)) return "Diaphragm";
      if (/intercostals/.test(title)) return "Intercostal muscles";
      if (/serratus posterior|levatores costarum|subcostals|transversus thoracis/.test(title)) return "Accessory rib movers";
      return existingFamily || "Other trunk muscles";
    }

    if (region === "pelvis-hip") {
      if (/gluteus/.test(title)) return "Gluteal muscles";
      if (/psoas|iliacus/.test(title)) return "Iliopsoas group";
      if (/tensor fasciae latae/.test(title)) return "Lateral hip stabilizers";
      if (group === "deep hip") return "Deep hip rotators";
      if (group === "medial thigh") return "Hip adductors";
      if (/biceps femoris|semitendinosus|semimembranosus/.test(title)) return "Hamstrings";
      if (/rectus femoris|sartorius/.test(title)) return "Anterior thigh hip flexors";
      if (/levator ani|puborectalis|pubococcygeus|iliococcygeus/.test(title)) return "Levator ani group";
      if (/coccygeus/.test(title)) return "Posterior pelvic diaphragm";
      if (/urethral sphincter|compressor urethrae|urethrovaginal sphincter/.test(title)) return "Urethral sphincter complex";
      if (/anal sphincter/.test(title)) return "Anal sphincter complex";
      if (group === "deep perineum") return "Deep perineal muscles";
      if (group === "superficial perineum") return "Superficial perineal muscles";
      return existingFamily || "Other hip and pelvic muscles";
    }

    if (region === "knee") {
      if (/rectus femoris|vastus |articularis genus/.test(title)) return "Quadriceps";
      if (/biceps femoris|semitendinosus|semimembranosus/.test(title)) return "Hamstrings";
      if (/sartorius|gracilis/.test(title)) return "Medial knee flexors";
      if (/gastrocnemius|plantaris/.test(title)) return "Calf-assisted knee flexors";
      if (/popliteus/.test(title)) return "Posterior knee rotators";
      return existingFamily || "Other knee muscles";
    }

    if (region === "foot-ankle") {
      if (group === "anterior lower leg") return "Anterior leg compartment";
      if (group === "lateral lower leg") return "Lateral leg compartment";
      if (/gastrocnemius|soleus|plantaris/.test(title)) return "Superficial posterior leg compartment";
      if (/tibialis posterior|flexor hallucis longus|flexor digitorum longus/.test(title)) return "Deep posterior leg compartment";
      if (/extensor digitorum brevis|extensor hallucis brevis/.test(title)) return "Dorsal intrinsic foot muscles";
      if (/abductor hallucis|flexor hallucis brevis|adductor hallucis/.test(title)) return "Great-toe intrinsic muscles";
      if (/abductor digiti minimi of the foot|flexor digiti minimi brevis of the foot/.test(title)) return "Fifth-toe intrinsic muscles";
      if (/flexor digitorum brevis|quadratus plantae|lumbricals of the foot/.test(title)) return "Central plantar muscles";
      if (/interossei of the foot/.test(title)) return "Foot interossei";
      return existingFamily || "Other ankle and foot muscles";
    }

    return existingFamily || muscleSectionGroup(item) || "Other muscles";
  }

  function openAnatomyViewer(item) {
    var dialog = document.getElementById("anatomyViewer");
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.id = "anatomyViewer";
      dialog.className = "anatomy-viewer";
      var panel = element("div", "anatomy-viewer-panel");
      var close = element("button", "anatomy-viewer-close", "Close");
      close.type = "button";
      close.addEventListener("click", function () { dialog.close(); });
      var image = document.createElement("img");
      image.className = "anatomy-viewer-image";
      var copy = element("div", "anatomy-viewer-copy");
      copy.append(element("p", "detail-kicker", "Anatomy plate"), element("h3", "anatomy-viewer-title"), element("p", "anatomy-viewer-note"));
      panel.append(close, image, copy);
      dialog.appendChild(panel);
      dialog.addEventListener("click", function (event) { if (event.target === dialog) dialog.close(); });
      document.body.appendChild(dialog);
    }
    dialog.querySelector(".anatomy-viewer-image").src = item.imageUrl;
    dialog.querySelector(".anatomy-viewer-image").alt = item.imageAlt || (item.title + " anatomy illustration");
    dialog.querySelector(".anatomy-viewer-title").textContent = item.title;
    dialog.querySelector(".anatomy-viewer-note").textContent = (item.imageAlt || "Anatomical reference plate") + ". The plate may include nearby structures for orientation.";
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function allItems() {
    return primaryTypes.flatMap(function (type) {
      return data[type].filter(function (item) { return item && item.published !== false; }).map(function (item) { return { type: type, item: item }; });
    });
  }

  function muscleRegion(item) {
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

  function muscleInRegion(item, region) {
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

  function muscleFunctionalRoles(item) {
    if (!item) return [];
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

  function createFunctionalRoleList(item, className) {
    var roles = muscleFunctionalRoles(item);
    if (!roles.length) return null;
    var list = element("ol", className || "muscle-role-list");
    roles.forEach(function (role) {
      var tag = element("li", "muscle-role");
      tag.append(element("span", "muscle-role-name", role));
      list.appendChild(tag);
    });
    return list;
  }

  function relationshipRecords(item) {
    var roles = muscleFunctionalRoles(item);
    var antagonistRoles = antagonistRolesFor(roles);
    var published = data.muscles.filter(function (candidate) {
      return candidate && candidate.published !== false && candidate.id !== item.id;
    });
    function matches(roleSet) {
      return published.map(function (candidate) {
        var candidateRoles = muscleFunctionalRoles(candidate);
        var shared = candidateRoles.filter(function (role) { return roleSet.indexOf(role) !== -1; });
        return { item: candidate, shared: shared };
      }).filter(function (record) { return record.shared.length; }).sort(function (a, b) {
        return b.shared.length - a.shared.length || String(a.item.title || "").localeCompare(String(b.item.title || ""));
      });
    }
    return { synergists: matches(roles), antagonists: matches(antagonistRoles) };
  }

  function createRelationshipColumn(title, description, records, className) {
    var column = element("section", "muscle-relationship-column " + className);
    column.append(element("h4", "", title), element("p", "muscle-relationship-description", description));
    if (!records.length) {
      column.appendChild(element("p", "muscle-relationship-empty", "No confidently classified match is available yet."));
      return column;
    }
    var list = element("ul", "muscle-relationship-list");
    records.slice(0, 12).forEach(function (record) {
      var row = document.createElement("li");
      var button = element("button", "muscle-relationship-link");
      button.type = "button";
      button.append(element("strong", "", record.item.title), element("span", "", record.shared.join(" · ")));
      button.addEventListener("click", function () { openDetail("muscles", record.item, true); });
      row.appendChild(button);
      list.appendChild(row);
    });
    column.appendChild(list);
    return column;
  }

  function createMovementRelationships(item) {
    var relationships = relationshipRecords(item);
    var section = element("section", "muscle-relationships");
    var heading = element("header", "muscle-relationships-heading");
    heading.append(element("p", "detail-kicker", "Movement relationships"), element("h3", "", "Muscles that work with or oppose this muscle"), element("p", "", "Synergists share at least one movement function. Antagonists carry the paired opposite action. These are movement-role matches, not a claim that every muscle fires equally in every task."));
    var grid = element("div", "muscle-relationship-grid");
    grid.append(
      createRelationshipColumn("Synergistic muscles", "Share one or more functions with this muscle.", relationships.synergists, "is-synergist"),
      createRelationshipColumn("Antagonistic muscles", "Perform a standardized opposing function.", relationships.antagonists, "is-antagonist")
    );
    section.append(heading, grid);
    return section;
  }

  function relationshipSearchMatch(item, query) {
    var match = query.match(/^(synergist|synergy|antagonist):\s*(.+)$/);
    if (!match) return false;
    var targetQuery = match[2].trim();
    var target = data.muscles.find(function (candidate) {
      return candidate && candidate.published !== false && (String(candidate.id || "").toLowerCase() === targetQuery || String(candidate.title || "").toLowerCase() === targetQuery);
    });
    if (!target) return false;
    var relationships = relationshipRecords(target);
    var records = match[1] === "antagonist" ? relationships.antagonists : relationships.synergists;
    return records.some(function (record) { return record.item.id === item.id; });
  }

  function selectType(type, carePathTarget) {
    activeType = type;
    if (type === "conditions") activeCarePath = carePathTarget || "all";
    else if (type !== "recipes") activeCarePath = "all";
    filterButtons.forEach(function (candidate) {
      var candidateCarePath = candidate.dataset.carePathTarget || "all";
      var selected = candidate.dataset.knowledgeFilter === type && (type !== "conditions" || candidateCarePath === activeCarePath);
      candidate.classList.toggle("is-active", selected);
      candidate.setAttribute("aria-pressed", String(selected));
    });
    muscleTools.hidden = type !== "muscles";
    muscleAtlas.hidden = type !== "muscles";
    if (recipeTools) recipeTools.hidden = true;
    if (carePathTools) carePathTools.hidden = true;
    render();
  }

  function positionMuscleDirectoryControls() {
    if (!muscleDirectoryControls) return;
    var placeBelowDirectory = activeType === "muscles" && activeMuscleRegion === "head-neck";
    muscleDirectoryControls.hidden = activeType !== "muscles";
    muscleDirectoryControls.classList.toggle("is-below-directory", placeBelowDirectory);
    if (placeBelowDirectory) {
      grid.insertAdjacentElement("afterend", muscleDirectoryControls);
      return;
    }
    if (muscleTools && muscleDirectoryControls.parentElement !== muscleTools) {
      muscleTools.insertBefore(muscleDirectoryControls, muscleActionBrowser || muscleTools.firstChild);
    } else if (muscleTools && muscleTools.firstElementChild !== muscleDirectoryControls) {
      muscleTools.insertBefore(muscleDirectoryControls, muscleActionBrowser || muscleTools.firstChild);
    }
  }

  function updateRecipeCounts() {
    var published = data.recipes.filter(function (item) { return item && item.published !== false && (activeCarePath === "all" || carePath(item) === activeCarePath); });
    recipeRegionButtons.forEach(function (button) {
      var region = button.dataset.recipeRegion;
      var count = region === "all" ? published.length : published.filter(function (item) { return (item.bodyRegion || "Whole body") === region; }).length;
      var target = button.querySelector("[data-recipe-count]");
      if (target) target.textContent = String(count);
      button.hidden = region !== "all" && count === 0;
    });
  }

  function updateCarePathCounts() {
    var source = activeType === "conditions" || activeType === "recipes" ? data[activeType] : [];
    var published = source.filter(function (item) { return item && item.published !== false; });
    carePathButtons.forEach(function (button) {
      var pathway = button.dataset.carePath;
      var count = pathway === "all" ? published.length : published.filter(function (item) { return carePath(item) === pathway; }).length;
      var target = button.querySelector("[data-care-count]");
      if (target) target.textContent = String(count);
      button.hidden = pathway !== "all" && count === 0;
    });
  }

  function renderAtlas() {
    function createAtlasCard(region) {
      var meta = muscleRegions[region];
      var count = data.muscles.filter(function (item) { return item && item.published !== false && muscleInRegion(item, region); }).length;
      var card = element("button", "atlas-card");
      card.type = "button";
      var image = document.createElement("img");
      image.src = meta.imageUrl; image.alt = meta.imageAlt; image.loading = "lazy"; image.decoding = "async";
      var copy = element("span", "atlas-card-copy");
      copy.append(element("b", "", meta.title), element("small", "", count + (count === 1 ? " muscle" : " muscles")), element("span", "", "Browse region →"));
      card.append(image, copy);
      card.addEventListener("click", function () {
        activeMuscleRegion = region;
        activeMuscleGroup = "all";
        muscleRegionButtons.forEach(function (candidate) {
          var selected = candidate.dataset.muscleRegion === region;
          candidate.classList.toggle("is-active", selected);
          candidate.setAttribute("aria-pressed", String(selected));
        });
        updateFunctionOptions();
        updateMuscleGroupFilters();
        render();
        grid.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return card;
    }
    if (activeMuscleRegion === "all") {
      atlasGrid.replaceChildren();
      muscleAtlas.hidden = true;
      return;
    }
    muscleAtlas.hidden = activeType !== "muscles";
    muscleAtlasTitle.textContent = muscleRegions[activeMuscleRegion].title + " anatomy reference";
    atlasGrid.replaceChildren(createAtlasCard(activeMuscleRegion));
  }

  function pluralRole(role) {
    if (role === "Thumb opposer") return "Thumb opposition";
    if (role === "Pelvic floor supporter") return "Pelvic floor support";
    if (role === "Urinary continence muscle") return "Urinary continence";
    if (role === "Fecal continence muscle") return "Fecal continence";
    if (/ muscle$/.test(role)) return role.replace(/ muscle$/, " muscles");
    return role + "s";
  }

  function renderMovementActions() {
    if (!muscleActionSections) return;
    var published = data.muscles.filter(function (item) { return item && item.published !== false; });
    var scoped = activeMuscleRegion === "all" ? published : published.filter(function (item) { return muscleInRegion(item, activeMuscleRegion); });
    if (muscleSelectionRegion) {
      muscleSelectionRegion.textContent = activeMuscleRegion === "all" ? "All body areas" : muscleRegions[activeMuscleRegion].title;
    }
    if (muscleSelectionAction) {
      muscleSelectionAction.textContent = activeMuscleFunction === "all" ? "Choose a movement" : pluralRole(activeMuscleFunction);
      muscleSelectionAction.classList.toggle("is-selected", activeMuscleFunction !== "all");
    }
    muscleActionTitle.textContent = activeMuscleRegion === "all"
      ? "What action are you looking for?"
      : "Explore " + muscleRegions[activeMuscleRegion].title + " by action";
    var sections = movementRoleSections.filter(function (section) {
      return activeMuscleRegion === "all" || section.regions.indexOf(activeMuscleRegion) !== -1;
    }).map(function (section) {
      var actions = section.roles.map(function (role) {
        var count = scoped.filter(function (item) { return muscleFunctionalRoles(item).indexOf(role) !== -1; }).length;
        if (!count) return null;
        var button = element("button", "muscle-action-card" + (activeMuscleFunction === role ? " is-active" : ""));
        button.type = "button";
        button.setAttribute("aria-pressed", String(activeMuscleFunction === role));
        button.append(element("strong", "", pluralRole(role)), element("small", "", count + (count === 1 ? " muscle" : " muscles") + " · view families"));
        button.addEventListener("click", function () {
          activeMuscleFunction = role;
          activeMuscleGroup = "all";
          muscleFunction.value = role;
          updateMuscleGroupFilters();
          render();
          grid.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        return button;
      }).filter(Boolean);
      if (!actions.length) return null;
      var actionGrid = element("div", "muscle-action-grid");
      actionGrid.replaceChildren.apply(actionGrid, actions);
      var block;
      if (activeMuscleRegion === "all") {
        block = element("details", "muscle-action-section muscle-action-disclosure");
        block.open = section.roles.indexOf(activeMuscleFunction) !== -1;
        var summary = document.createElement("summary");
        summary.append(element("span", "", section.title), element("small", "", actions.length + (actions.length === 1 ? " movement" : " movements")), element("b", "", "+"));
        block.append(summary, actionGrid);
      } else {
        block = element("section", "muscle-action-section");
        block.append(element("h4", "", section.title), actionGrid);
      }
      return block;
    }).filter(Boolean);
    muscleActionSections.replaceChildren.apply(muscleActionSections, sections);
  }

  function updateMuscleCounts() {
    var muscles = data.muscles.filter(function (item) { return item && item.published !== false; });
    document.querySelectorAll("[data-region-count]").forEach(function (node) {
      var region = node.dataset.regionCount;
      var count = region === "all" ? muscles.length : muscles.filter(function (item) { return muscleInRegion(item, region); }).length;
      node.textContent = String(count);
    });
  }

  function updateTypeCounts() {
    document.querySelectorAll("[data-type-count]").forEach(function (node) {
      var type = node.dataset.typeCount;
      var count = data[type].filter(function (item) { return item && item.published !== false; }).length;
      node.textContent = count + (count === 1 ? " guide" : " guides");
    });
    document.querySelectorAll("[data-care-path-count]").forEach(function (node) {
      var pathway = node.dataset.carePathCount;
      var count = data.conditions.filter(function (item) {
        return item && item.published !== false && carePath(item) === pathway;
      }).length;
      node.textContent = count + (count === 1 ? " guide" : " guides");
    });
  }

  function updateUrl(type, id) {
    var url = new URL(window.location.href);
    if (type && id) { url.searchParams.set("type", type); url.searchParams.set("id", id); }
    else { url.searchParams.delete("type"); url.searchParams.delete("id"); }
    history.pushState({}, "", url.pathname + url.search);
  }

  function openDetail(type, item, shouldUpdateUrl) {
    if (!labels[type] || !item) return;
    var intro = element("div", "detail-intro");
    intro.append(element("p", "detail-kicker", contentLabel(type, item)), element("h2", "", item.title || "Untitled"), element("p", "detail-summary", summaries[type](item)));
    if (type === "conditions" || type === "recipes") {
      var path = carePath(item);
      var pathNotice = element("div", "detail-care-path is-" + path);
      pathNotice.append(element("strong", "", carePaths[path].label), element("p", "", carePaths[path].description));
      intro.appendChild(pathNotice);
    }
    var list = element("dl", "detail-fields");
    fields[type].forEach(function (definition) {
      var value = type === "muscles" && definition[0] === "family" ? muscleFamily(item) : item[definition[0]];
      if (type === "muscles" && definition[0] === "actions" && !value) value = item.function;
      if (typeof value !== "string" || !value.trim()) return;
      var row = element("div", "detail-field");
      row.append(element("dt", "", definition[1]), element("dd", "", value));
      list.appendChild(row);
    });
    var body = element("div", "detail-layout");
    var facts = element("div", "detail-facts");
    if (type === "muscles") {
      var movementFunctions = element("section", "detail-movement-functions");
      movementFunctions.append(element("p", "detail-kicker", "Movement functions"), element("h3", "", "Functions"));
      var detailRoles = createFunctionalRoleList(item, "muscle-role-list detail-muscle-roles");
      if (detailRoles) movementFunctions.appendChild(detailRoles);
      if (item.actions || item.function) movementFunctions.appendChild(element("p", "detail-action-notes", item.actions || item.function));
      facts.appendChild(movementFunctions);
    }
    if (type === "muscles" && typeof item.imageUrl === "string" && /^https:\/\//i.test(item.imageUrl)) {
      var focusedImage = hasFocusedMuscleImage(item);
      var figure = element("figure", "detail-anatomy-image");
      figure.classList.add(focusedImage ? "is-focused" : "is-regional");
      var anatomyButton = element("button", "anatomy-zoom-button");
      anatomyButton.type = "button";
      anatomyButton.setAttribute("aria-label", "Enlarge anatomy plate for " + item.title);
      var anatomyImage = document.createElement("img");
      anatomyImage.src = item.imageUrl;
      anatomyImage.alt = item.imageAlt || (item.title + " anatomy illustration");
      anatomyImage.loading = "eager";
      anatomyImage.decoding = "async";
      anatomyButton.append(anatomyImage, element("span", "anatomy-zoom-label", "Enlarge plate"));
      anatomyButton.addEventListener("click", function () { openAnatomyViewer(item); });
      figure.appendChild(anatomyButton);
      if (item.imageCredit) {
        var caption = document.createElement("figcaption");
        if (typeof item.imageCreditUrl === "string" && /^https:\/\//i.test(item.imageCreditUrl)) {
          var creditLink = document.createElement("a");
          creditLink.href = item.imageCreditUrl;
          creditLink.target = "_blank";
          creditLink.rel = "noopener noreferrer";
          creditLink.textContent = item.imageCredit;
          caption.append(focusedImage ? "Highlighted anatomy: " : "Regional anatomy reference: ", creditLink);
        } else caption.textContent = (focusedImage ? "Highlighted anatomy: " : "Regional anatomy reference: ") + item.imageCredit;
        caption.append(focusedImage
          ? ". The named muscle is distinctly highlighted; nearby structures may remain visible for anatomical context."
          : ". Use this plate for anatomical orientation; the named muscle may not be individually color-highlighted.");
        figure.appendChild(caption);
      }
      facts.appendChild(figure);
    }
    var disclaimer = type !== "muscles" && carePath(item) === "musculoskeletal-condition"
      ? "This guide is educational and does not diagnose or treat a musculoskeletal condition. A suspected dislocation, visible deformity, inability to bear weight, substantial swelling, worsening pain, numbness, weakness, or new bladder or bowel changes needs prompt medical assessment before self-guided exercise."
      : "This postural and movement resource describes observable patterns, not a diagnosis that a joint or bone is out of place. Pain, acute injury, neurological symptoms, or uncertainty about exercise should be assessed by a qualified clinician.";
    facts.append(list, element("p", "detail-disclaimer", disclaimer));
    if (type === "muscles" && item.sourceName && typeof item.sourceUrl === "string" && /^https:\/\//i.test(item.sourceUrl)) {
      var source = element("p", "detail-source", "Reference: ");
      var sourceLink = document.createElement("a");
      sourceLink.href = item.sourceUrl; sourceLink.target = "_blank"; sourceLink.rel = "noopener noreferrer"; sourceLink.textContent = item.sourceName;
      source.appendChild(sourceLink); facts.appendChild(source);
    }
    if (type === "recipes" && item.sourceName && typeof item.sourceUrl === "string" && /^https:\/\//i.test(item.sourceUrl)) {
      var recipeSource = element("p", "detail-source", "General exercise reference: ");
      var recipeSourceLink = document.createElement("a");
      recipeSourceLink.href = item.sourceUrl;
      recipeSourceLink.target = "_blank";
      recipeSourceLink.rel = "noopener noreferrer";
      recipeSourceLink.textContent = item.sourceName;
      recipeSource.appendChild(recipeSourceLink);
      facts.appendChild(recipeSource);
    }
    if (type === "conditions" && item.sourceName && typeof item.sourceUrl === "string" && /^https:\/\//i.test(item.sourceUrl)) {
      var conditionSource = element("p", "detail-source", "Clinical education reference: ");
      var conditionSourceLink = document.createElement("a");
      conditionSourceLink.href = item.sourceUrl;
      conditionSourceLink.target = "_blank";
      conditionSourceLink.rel = "noopener noreferrer";
      conditionSourceLink.textContent = item.sourceName;
      conditionSource.appendChild(conditionSourceLink);
      facts.appendChild(conditionSource);
    }
    body.append(intro, facts);
    var relatedIds = typeof item.relatedVideoIds === "string" ? item.relatedVideoIds.split(",").map(function (id) { return id.trim(); }).filter(Boolean) : [];
    var relatedVideos = videos.filter(function (video) { return video && video.published !== false && relatedIds.indexOf(video.id) !== -1; });
    var related = null;
    if (relatedVideos.length) {
      related = element("section", "related-sessions");
      var relatedHeading = element("div", "related-heading");
      var relatedHeadingCopy = element("div", "related-heading-copy");
      relatedHeadingCopy.append(
        element("p", "detail-kicker", type === "muscles" ? "Train this area" : type === "recipes" ? "Ready for guided progression" : "Put it into practice"),
        element("h3", "", type === "muscles" ? "Related programs" : type === "recipes" ? "Continue with a complete program" : "Related guided sessions")
      );
      relatedHeading.appendChild(relatedHeadingCopy);
      if (type === "muscles") relatedHeading.appendChild(element("p", "related-program-context", "Programs selected for the movement roles and body region described in this muscle guide."));
      if (type === "recipes") relatedHeading.appendChild(element("p", "related-program-context", "Use this free recipe as a starting point. Choose a structured follow-along program when you want a complete progression."));
      var relatedGrid = element("div", "related-session-grid");
      relatedVideos.forEach(function (video) {
        var card = element("a", "related-session-card");
        if (type === "muscles") card.classList.add("is-program-match");
        card.href = "video.html?id=" + encodeURIComponent(video.id);
        var copy = element("div", "related-session-copy");
        copy.append(element("span", "", (type === "muscles" ? "Related program · " : "") + String(video.durationMinutes || "") + " min · " + (video.level || "Session")), element("h4", "", video.title || "Movement session"), element("p", "", video.description || "Follow this focused guided session."), element("b", "", type === "muscles" ? "Explore this program →" : "View session →"));
        var imageUrl = typeof video.thumbnailUrl === "string" && /^https:\/\//.test(video.thumbnailUrl) ? video.thumbnailUrl : "";
        if (imageUrl) { var image = document.createElement("img"); image.src = imageUrl; image.alt = ""; image.loading = "lazy"; card.appendChild(image); }
        card.appendChild(copy); relatedGrid.appendChild(card);
      });
      related.append(relatedHeading, relatedGrid);
    }
    detailContent.replaceChildren(body);
    if (type === "muscles") detailContent.appendChild(createMovementRelationships(item));
    if (related) detailContent.appendChild(related);
    directory.hidden = true;
    detail.hidden = false;
    document.title = (item.title || "Movement Guide") + " — LegitBodyFix";
    if (shouldUpdateUrl !== false) updateUrl(type, item.id);
    detail.scrollIntoView({ behavior: shouldUpdateUrl === false ? "auto" : "smooth", block: "start" });
  }

  function showDirectory(shouldUpdateUrl) {
    detail.hidden = true;
    directory.hidden = false;
    document.title = "Movement Guides — LegitBodyFix";
    if (shouldUpdateUrl !== false) updateUrl();
  }

  function createCard(record) {
    var card = element("button", "knowledge-card");
    card.type = "button";
    card.setAttribute("aria-label", "Read about " + record.item.title);
    if (record.type === "muscles") {
      var roles = createFunctionalRoleList(record.item);
      if (roles) card.appendChild(roles);
    }
    if (record.type === "recipes") {
      card.classList.add("is-recipe");
      var recipeMeta = element("span", "recipe-card-meta");
      recipeMeta.append(element("b", "", record.item.bodyRegion || "Whole body"), element("i", "", record.item.time || "10–15 min"));
      card.appendChild(recipeMeta);
    }
    if (record.type === "conditions" || record.type === "recipes") card.classList.add("care-path-" + carePath(record.item));
    card.append(element("span", "knowledge-card-type", contentLabel(record.type, record.item)), element("h3", "", record.item.title), element("p", "", summaries[record.type](record.item)), element("span", "knowledge-card-link", record.type === "recipes" ? "Open the recipe →" : "Read the guide →"));
    card.addEventListener("click", function () { openDetail(record.type, record.item); });
    return card;
  }

  function updateFunctionOptions() {
    var availableMuscles = data.muscles.filter(function (item) { return item && item.published !== false; });
    Array.from(muscleFunction.options).forEach(function (option) {
      if (!option.dataset.baseLabel) option.dataset.baseLabel = option.textContent;
      var count = option.value === "all"
        ? availableMuscles.length
        : availableMuscles.filter(function (item) { return muscleFunctionalRoles(item).indexOf(option.value) !== -1; }).length;
      option.textContent = option.dataset.baseLabel + " (" + count + ")";
      option.disabled = false;
    });
    var selectedOption = muscleFunction.options[muscleFunction.selectedIndex];
    if (selectedOption && selectedOption.disabled) {
      activeMuscleFunction = "all";
      muscleFunction.value = "all";
    }
  }

  function orderedMuscleGroups(items) {
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

  function updateMuscleGroupFilters() {
    if (activeMuscleRegion === "all" || activeMuscleFunction === "all") {
      activeMuscleGroup = "all";
      muscleGroupFilters.replaceChildren();
      muscleGroupFilterShell.hidden = true;
      return;
    }
    var regionalMuscles = data.muscles.filter(function (item) {
      return item && item.published !== false && muscleInRegion(item, activeMuscleRegion) && muscleFunctionalRoles(item).indexOf(activeMuscleFunction) !== -1;
    });
    var groupNames = activeMuscleRegion === "head-neck"
      ? Array.from(new Set(regionalMuscles.map(neckDirectoryGroup)))
      : orderedMuscleGroups(regionalMuscles);
    if (activeMuscleRegion === "head-neck") groupNames = collectiveNeckGroups.filter(function (groupName) { return groupNames.indexOf(groupName) !== -1; });
    if (activeMuscleGroup !== "all" && groupNames.indexOf(activeMuscleGroup) === -1) activeMuscleGroup = "all";
    var buttons = [];
    var overview = element("button", activeMuscleGroup === "all" ? "is-active" : "");
    overview.type = "button";
    overview.setAttribute("role", "tab");
    overview.setAttribute("aria-selected", String(activeMuscleGroup === "all"));
    overview.append(document.createTextNode((activeMuscleRegion === "head-neck" ? "Neck directory " : "All groups ")), element("span", "", String(regionalMuscles.length)));
    overview.addEventListener("click", function () {
      activeMuscleGroup = "all";
      updateMuscleGroupFilters();
      render();
    });
    buttons.push(overview);
    buttons = buttons.concat(groupNames.map(function (groupName) {
      var count = regionalMuscles.filter(function (item) {
        return activeMuscleRegion === "head-neck" ? neckDirectoryGroups(item).indexOf(groupName) !== -1 : muscleSectionGroup(item) === groupName;
      }).length;
      var button = element("button", activeMuscleGroup === groupName ? "is-active" : "");
      button.type = "button";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(activeMuscleGroup === groupName));
      button.append(document.createTextNode(groupName + " "), element("span", "", String(count)));
      button.addEventListener("click", function () {
        activeMuscleGroup = groupName;
        updateMuscleGroupFilters();
        render();
      });
      return button;
    }));
    muscleGroupFilters.replaceChildren.apply(muscleGroupFilters, buttons);
    muscleGroupFilterShell.hidden = !buttons.length;
  }

  function renderNeckDirectory(regionRecords, section, heading) {
    var collectiveIds = new Set();
    var directoryEntries = collectiveNeckGroups.map(function (groupName) {
      var members = regionRecords.filter(function (record) { return neckDirectoryGroups(record.item).indexOf(groupName) !== -1; });
      if (!members.length) return null;
      members.forEach(function (record) { collectiveIds.add(record.item.id); });
      var groupImage = collectiveNeckGroupImages[groupName];
      var card = element("button", "knowledge-card muscle-collective-card");
      card.type = "button";
      card.setAttribute("aria-label", "Explore " + groupName);
      if (groupImage) {
        card.classList.add("has-media");
        var media = element("span", "knowledge-card-media");
        var image = document.createElement("img");
        image.src = groupImage.imageUrl;
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";
        var imageLabel = element("span", "knowledge-card-media-label", groupImage.label);
        imageLabel.classList.add(groupImage.focused ? "is-focused" : "is-regional");
        media.append(image, imageLabel);
        card.appendChild(media);
      }
      card.append(
        element("span", "knowledge-card-type", "Muscle group"),
        element("h3", "", groupName),
        element("p", "", collectiveNeckGroupDescriptions[groupName]),
        element("span", "knowledge-card-link", "Explore specific muscles →")
      );
      card.addEventListener("click", function () {
        activeMuscleGroup = groupName;
        updateMuscleGroupFilters();
        render();
        grid.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return { title: groupName, card: card };
    }).filter(Boolean);
    var namedRecords = regionRecords.filter(function (record) { return !collectiveIds.has(record.item.id); });
    namedRecords.forEach(function (record) {
      directoryEntries.push({ title: String(record.item.title || ""), card: createCard(record) });
    });
    directoryEntries.sort(function (a, b) { return a.title.localeCompare(b.title); });
    var directory = element("div", "muscle-region-grid neck-visual-directory");
    directory.replaceChildren.apply(directory, directoryEntries.map(function (entry) { return entry.card; }));
    section.append(heading, directory);
  }

  function renderMuscleGroups(records) {
    var regionOrder = Object.keys(muscleRegions);
    var visibleRegions = activeMuscleRegion === "all" ? regionOrder : [activeMuscleRegion];
    var sections = visibleRegions.map(function (region) {
      var regionRecords = records.filter(function (record) {
        return activeMuscleRegion === "all" ? muscleRegion(record.item) === region : muscleInRegion(record.item, region);
      });
      if (!regionRecords.length) return null;
      var meta = muscleRegions[region] || { title: "Other muscles" };
      var section = element("section", "muscle-region-section");
      section.setAttribute("aria-labelledby", "muscle-region-" + region);
      var heading = element("header", "muscle-region-heading");
      var title = element("h3", "", meta.title);
      title.id = "muscle-region-" + region;
      var regionalTotal = data.muscles.filter(function (item) { return item && item.published !== false && muscleInRegion(item, region); }).length;
      heading.append(title, element("span", "", regionalTotal + (regionalTotal === 1 ? " muscle in directory" : " muscles in directory")));
      if (region === "head-neck" && activeMuscleGroup === "all") {
        renderNeckDirectory(regionRecords, section, heading);
        return section;
      }
      var subgroups = element("div", "muscle-subgroups");
      var groupNames = orderedMuscleGroups(regionRecords.map(function (record) { return record.item; }));
      groupNames.forEach(function (groupName) {
        var groupRecords = regionRecords.filter(function (record) { return muscleSectionGroup(record.item) === groupName; });
        var subgroup = element("section", "muscle-subgroup");
        var subgroupHeading = element("div", "muscle-subgroup-heading");
        subgroupHeading.append(element("h4", "", groupName), element("span", "", String(groupRecords.length)));
        var familyNames = Array.from(new Set(groupRecords.map(function (record) { return muscleFamily(record.item); }).filter(Boolean)));
        familyNames.sort(function (a, b) {
          var aIndex = muscleFamilyOrder.indexOf(a), bIndex = muscleFamilyOrder.indexOf(b);
          if (aIndex === -1) aIndex = muscleFamilyOrder.length;
          if (bIndex === -1) bIndex = muscleFamilyOrder.length;
          return aIndex === bIndex ? a.localeCompare(b) : aIndex - bIndex;
        });
        if (familyNames.length) {
          var familyList = element("div", "muscle-family-list");
          var ungrouped = groupRecords.filter(function (record) { return !muscleFamily(record.item); });
          if (ungrouped.length) familyNames.push("Other " + groupName.toLowerCase() + " muscles");
          familyNames.forEach(function (familyName) {
            var isOther = familyName.indexOf("Other ") === 0;
            var familyRecords = isOther ? ungrouped : groupRecords.filter(function (record) { return muscleFamily(record.item) === familyName; });
            var family = element("section", "muscle-family");
            var familyHeading = element("div", "muscle-family-heading");
            familyHeading.append(element("h5", "", familyName), element("span", "", familyRecords.length + (familyRecords.length === 1 ? " muscle" : " muscles")));
            var familyGrid = element("div", "muscle-region-grid");
            familyGrid.replaceChildren.apply(familyGrid, familyRecords.map(createCard));
            family.append(familyHeading, familyGrid);
            familyList.appendChild(family);
          });
          subgroup.append(subgroupHeading, familyList);
        } else {
          var regionGrid = element("div", "muscle-region-grid");
          regionGrid.replaceChildren.apply(regionGrid, groupRecords.map(createCard));
          subgroup.append(subgroupHeading, regionGrid);
        }
        subgroups.appendChild(subgroup);
      });
      section.append(heading, subgroups);
      return section;
    }).filter(Boolean);
    grid.replaceChildren.apply(grid, sections);
  }

  function renderMuscleActionResults(records) {
    var buckets = new Map();
    records.forEach(function (record) {
      var familyName = movementFamily(record.item, activeMuscleFunction);
      var key = familyName || "Other muscles";
      if (!buckets.has(key)) buckets.set(key, { records: [], grouped: true });
      buckets.get(key).records.push(record);
    });
    var section = element("section", "movement-results");
    var heading = element("header", "movement-results-heading");
    heading.append(element("p", "eyebrow", "Movement role"), element("h3", "", pluralRole(activeMuscleFunction)), element("p", "", "Muscles are grouped by recognizable anatomy. Expand a family only when you need the individual names."));
    var groups = element("div", "movement-family-grid");
    var openSingleFamily = buckets.size === 1;
    Array.from(buckets.keys()).sort().forEach(function (name) {
      var bucket = buckets.get(name);
      var familyRecords = bucket.records.sort(function (a, b) { return String(a.item.title || "").localeCompare(String(b.item.title || "")); });
      var family = document.createElement("details");
      family.className = "movement-family";
      family.open = openSingleFamily;
      var summary = document.createElement("summary");
      summary.append(element("span", "", "Muscle family"), element("strong", "", name), element("small", "", familyRecords.length + (familyRecords.length === 1 ? " muscle" : " muscles") + (openSingleFamily ? " · shown" : " · expand")));
      var familyGrid = element("div", "muscle-region-grid");
      familyGrid.replaceChildren.apply(familyGrid, familyRecords.map(createCard));
      family.append(summary, familyGrid);
      groups.appendChild(family);
    });
    section.append(heading, groups);
    grid.replaceChildren(section);
  }

  function renderRecipeGroups(records) {
    var regionOrder = ["Neck & shoulders", "Trunk & breathing", "Hip & pelvis", "Knee", "Ankle & foot", "Whole body"];
    var regions = Array.from(new Set(records.map(function (record) { return record.item.bodyRegion || "Whole body"; })));
    regions.sort(function (a, b) {
      var aIndex = regionOrder.indexOf(a), bIndex = regionOrder.indexOf(b);
      if (aIndex === -1) aIndex = regionOrder.length;
      if (bIndex === -1) bIndex = regionOrder.length;
      return aIndex === bIndex ? a.localeCompare(b) : aIndex - bIndex;
    });
    var sections = regions.map(function (region) {
      var regionRecords = records.filter(function (record) { return (record.item.bodyRegion || "Whole body") === region; });
      var section = element("section", "recipe-region-section");
      var heading = element("header", "recipe-region-heading");
      heading.append(element("h3", "", region), element("span", "", regionRecords.length + (regionRecords.length === 1 ? " recipe" : " recipes")));
      var recipeGrid = element("div", "recipe-region-grid");
      recipeGrid.replaceChildren.apply(recipeGrid, regionRecords.map(createCard));
      section.append(heading, recipeGrid);
      return section;
    });
    grid.replaceChildren.apply(grid, sections);
  }

  function renderConditionGroups(records) {
    var categoryOrder = ["Sprains & strains", "Dislocations & instability", "Disc-related & radiating symptoms", "Peripheral nerve compression"];
    var categories = Array.from(new Set(records.map(function (record) { return record.item.conditionCategory || "Other conditions"; })));
    categories.sort(function (a, b) {
      var aIndex = categoryOrder.indexOf(a), bIndex = categoryOrder.indexOf(b);
      if (aIndex === -1) aIndex = categoryOrder.length;
      if (bIndex === -1) bIndex = categoryOrder.length;
      return aIndex === bIndex ? a.localeCompare(b) : aIndex - bIndex;
    });
    var sections = categories.map(function (category) {
      var categoryRecords = records.filter(function (record) { return (record.item.conditionCategory || "Other conditions") === category; });
      categoryRecords.sort(function (a, b) {
        var regionCompare = String(a.item.bodyRegion || "").localeCompare(String(b.item.bodyRegion || ""));
        return regionCompare || String(a.item.title || "").localeCompare(String(b.item.title || ""));
      });
      var section = element("section", "condition-category-section");
      var heading = element("header", "condition-category-heading");
      var headingCopy = element("div");
      headingCopy.append(element("span", "", "Condition family"), element("h3", "", category));
      heading.append(headingCopy, element("b", "", categoryRecords.length + (categoryRecords.length === 1 ? " guide" : " guides")));
      var conditionGrid = element("div", "condition-category-grid");
      conditionGrid.replaceChildren.apply(conditionGrid, categoryRecords.map(createCard));
      section.append(heading, conditionGrid);
      return section;
    });
    grid.replaceChildren.apply(grid, sections);
  }

  function renderPostureGroups(records) {
    var categoryOrder = ["Head & neck", "Shoulder & scapula", "Rib cage & trunk", "Pelvis & hip", "Knee & leg", "Foot & ankle"];
    var categories = Array.from(new Set(records.map(function (record) { return record.item.postureCategory || "Other movement patterns"; })));
    categories.sort(function (a, b) {
      var aIndex = categoryOrder.indexOf(a), bIndex = categoryOrder.indexOf(b);
      if (aIndex === -1) aIndex = categoryOrder.length;
      if (bIndex === -1) bIndex = categoryOrder.length;
      return aIndex === bIndex ? a.localeCompare(b) : aIndex - bIndex;
    });
    var sections = categories.map(function (category) {
      var categoryRecords = records.filter(function (record) { return (record.item.postureCategory || "Other movement patterns") === category; });
      categoryRecords.sort(function (a, b) { return String(a.item.title || "").localeCompare(String(b.item.title || "")); });
      var section = element("section", "condition-category-section posture-category-section");
      var heading = element("header", "condition-category-heading posture-category-heading");
      var headingCopy = element("div");
      headingCopy.append(element("span", "", "Body area"), element("h3", "", category));
      heading.append(headingCopy, element("b", "", categoryRecords.length + (categoryRecords.length === 1 ? " guide" : " guides")));
      var postureGrid = element("div", "condition-category-grid posture-category-grid");
      postureGrid.replaceChildren.apply(postureGrid, categoryRecords.map(createCard));
      section.append(heading, postureGrid);
      return section;
    });
    grid.replaceChildren.apply(grid, sections);
  }

  function render() {
    var query = search.value.trim().toLowerCase();
    positionMuscleDirectoryControls();
    knowledgePaths.hidden = activeType !== "all" || Boolean(query);
    updateCarePathCounts();
    updateRecipeCounts();
    renderMovementActions();
    renderAtlas();
    var records = allItems().filter(function (record) {
      if (activeType !== "all" && record.type !== activeType) return false;
      if (activeType === "muscles" && activeMuscleRegion !== "all" && !muscleInRegion(record.item, activeMuscleRegion)) return false;
      if (activeType === "muscles" && activeMuscleGroup !== "all" && !query) {
        var matchesActiveGroup = activeMuscleRegion === "head-neck"
          ? neckDirectoryGroups(record.item).indexOf(activeMuscleGroup) !== -1
          : muscleSectionGroup(record.item) === activeMuscleGroup;
        if (!matchesActiveGroup) return false;
      }
      if (activeType === "muscles" && activeMuscleFunction !== "all" && muscleFunctionalRoles(record.item).indexOf(activeMuscleFunction) === -1) return false;
      if (activeType === "muscles" && activeMuscleVisual !== "all" && muscleVisualType(record.item) !== activeMuscleVisual) return false;
      if (activeType === "recipes" && activeRecipeRegion !== "all" && (record.item.bodyRegion || "Whole body") !== activeRecipeRegion) return false;
      if ((activeType === "conditions" || activeType === "recipes") && activeCarePath !== "all" && carePath(record.item) !== activeCarePath) return false;
      if (!query) return true;
      var fieldMatch = Object.values(record.item).some(function (value) { return typeof value === "string" && value.toLowerCase().includes(query); });
      var roleQuery = query.endsWith("s") ? query.slice(0, -1) : query;
      var roleMatch = record.type === "muscles" && muscleFunctionalRoles(record.item).some(function (role) {
        return role.toLowerCase().includes(query) || role.toLowerCase().includes(roleQuery) || movementTagId(role).toLowerCase() === query;
      });
      var relationshipMatch = record.type === "muscles" && relationshipSearchMatch(record.item, query);
      return fieldMatch || roleMatch || relationshipMatch;
    });
    var groupMuscles = activeType === "muscles" && muscleSort.value === "body" && activeMuscleFunction === "all" && activeMuscleVisual === "all" && !query;
    var groupMovementResults = activeType === "muscles" && activeMuscleFunction !== "all" && activeMuscleVisual === "all" && !query;
    var groupRecipes = activeType === "recipes" && !query;
    var groupConditions = activeType === "conditions" && activeCarePath === "musculoskeletal-condition" && !query;
    var groupPosture = activeType === "conditions" && activeCarePath === "postural-movement" && !query;
    if (activeType === "muscles" && muscleSort.value === "alpha") {
      records.sort(function (a, b) { return String(a.item.title || "").localeCompare(String(b.item.title || "")); });
    }
    if (activeType === "all" && !query) {
      grid.replaceChildren();
      grid.hidden = true;
      grid.classList.remove("is-grouped");
      grid.setAttribute("aria-busy", "false");
      status.textContent = "Choose a collection above, or search across all resources.";
      return;
    }
    if (activeType === "muscles" && activeMuscleRegion === "all" && activeMuscleFunction === "all" && activeMuscleVisual === "all" && !query) {
      grid.replaceChildren();
      grid.hidden = true;
      grid.classList.remove("is-grouped");
      grid.setAttribute("aria-busy", "false");
      status.textContent = activeMuscleRegion === "all" ? "Choose a movement action, or narrow the action cards by body region." : "Choose a " + muscleRegions[activeMuscleRegion].title.toLowerCase() + " action above to reveal its muscle families.";
      return;
    }
    grid.hidden = false;
    grid.classList.toggle("is-grouped", (groupMuscles || groupMovementResults || groupRecipes || groupConditions || groupPosture) && Boolean(records.length));
    if (!records.length) grid.replaceChildren(element("p", "knowledge-empty", "No published resources match that search yet."));
    else if (groupMovementResults) renderMuscleActionResults(records);
    else if (groupMuscles) renderMuscleGroups(records);
    else if (groupRecipes) renderRecipeGroups(records);
    else if (groupConditions) renderConditionGroups(records);
    else if (groupPosture) renderPostureGroups(records);
    else grid.replaceChildren.apply(grid, records.map(createCard));
    grid.setAttribute("aria-busy", "false");
    status.textContent = activeType === "muscles"
      ? records.length + (records.length === 1 ? " muscle" : " muscles") + (activeMuscleFunction === "all" ? (activeMuscleRegion === "all" ? " across 9 anatomical regions" : " in this anatomical region") : " matching " + activeMuscleFunction.toLowerCase()) + (activeMuscleVisual === "focused" ? " with a highlighted anatomy image" : activeMuscleVisual === "regional" ? " using a regional anatomy reference" : "")
      : activeType === "recipes"
        ? records.length + (records.length === 1 ? " correction recipe" : " correction recipes") + (activeCarePath === "all" ? " across both pathways" : " in " + carePaths[activeCarePath].label.toLowerCase()) + (activeRecipeRegion === "all" ? ", grouped by body area" : " for " + activeRecipeRegion.toLowerCase())
        : records.length + (records.length === 1 ? " movement or recovery guide" : " movement and recovery guides") + (activeCarePath === "all" ? "" : " in " + carePaths[activeCarePath].label.toLowerCase()) + (groupConditions ? ", grouped by condition family" : groupPosture ? ", grouped by body area" : "");
  }

  function openFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var type = params.get("type");
    var id = params.get("id");
    var query = params.get("q");
    if (labels[type] && !id && query) {
      showDirectory(false);
      search.value = query.slice(0, 120);
      selectType(type);
      render();
      return;
    }
    if (labels[type] && !id) {
      showDirectory(false);
      selectType(type);
      return;
    }
    if (!labels[type] || !id) { showDirectory(false); return; }
    var item = data[type].find(function (candidate) { return candidate.id === id && candidate.published !== false; });
    if (item) openDetail(type, item, false);
    else showDirectory(false);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      selectType(button.dataset.knowledgeFilter, button.dataset.carePathTarget);
    });
  });
  Array.from(document.querySelectorAll("[data-knowledge-path]")).forEach(function (button) {
    button.addEventListener("click", function () { selectType(button.dataset.knowledgePath, button.dataset.carePathTarget); });
  });
  muscleRegionButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeMuscleRegion = button.dataset.muscleRegion;
      activeMuscleGroup = "all";
      muscleRegionButtons.forEach(function (candidate) { var selected = candidate === button; candidate.classList.toggle("is-active", selected); candidate.setAttribute("aria-pressed", String(selected)); });
      updateFunctionOptions();
      updateMuscleGroupFilters();
      render();
    });
  });
  muscleFunction.addEventListener("change", function () {
    activeMuscleFunction = muscleFunction.value;
    activeMuscleGroup = "all";
    if (activeMuscleFunction !== "all") {
      activeMuscleRegion = "all";
      muscleRegionButtons.forEach(function (candidate) {
        var selected = candidate.dataset.muscleRegion === "all";
        candidate.classList.toggle("is-active", selected);
        candidate.setAttribute("aria-pressed", String(selected));
      });
    }
    updateMuscleGroupFilters();
    render();
  });
  muscleVisual.addEventListener("change", function () {
    activeMuscleVisual = muscleVisual.value;
    render();
  });
  muscleSort.addEventListener("change", render);
  muscleReset.addEventListener("click", function () {
    activeMuscleRegion = "all";
    activeMuscleGroup = "all";
    activeMuscleFunction = "all";
    activeMuscleVisual = "all";
    muscleFunction.value = "all";
    muscleVisual.value = "all";
    muscleSort.value = "body";
    search.value = "";
    muscleRegionButtons.forEach(function (candidate) {
      var selected = candidate.dataset.muscleRegion === "all";
      candidate.classList.toggle("is-active", selected);
      candidate.setAttribute("aria-pressed", String(selected));
    });
    updateFunctionOptions();
    updateMuscleGroupFilters();
    render();
  });
  recipeRegionButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeRecipeRegion = button.dataset.recipeRegion;
      recipeRegionButtons.forEach(function (candidate) {
        var selected = candidate === button;
        candidate.classList.toggle("is-active", selected);
        candidate.setAttribute("aria-pressed", String(selected));
      });
      render();
    });
  });
  carePathButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      activeCarePath = button.dataset.carePath;
      carePathButtons.forEach(function (candidate) {
        var selected = candidate === button;
        candidate.classList.toggle("is-active", selected);
        candidate.setAttribute("aria-pressed", String(selected));
      });
      render();
    });
  });
  search.addEventListener("input", render);
  document.getElementById("detailBack").addEventListener("click", function () { showDirectory(); });
  window.addEventListener("popstate", openFromUrl);

  Promise.all([
    fetch("assets/data/knowledge-base.json", { cache: "no-cache" }),
    fetch("assets/data/videos.json", { cache: "no-cache" })
  ]).then(function (responses) {
    if (!responses[0].ok || !responses[1].ok) throw new Error("Unable to load public content");
    return Promise.all([responses[0].json(), responses[1].json()]);
  }).then(function (payloads) {
      var payload = payloads[0];
      videos = Array.isArray(payloads[1]) ? payloads[1] : [];
      Object.keys(labels).forEach(function (type) { data[type] = Array.isArray(payload[type]) ? payload[type] : []; });
      updateMuscleCounts();
      updateMuscleGroupFilters();
      updateFunctionOptions();
      updateRecipeCounts();
      updateTypeCounts();
      renderAtlas();
      render();
      openFromUrl();
    })
    .catch(function () { status.textContent = "The movement guides are temporarily unavailable."; status.setAttribute("role", "alert"); grid.setAttribute("aria-busy", "false"); });
})();
