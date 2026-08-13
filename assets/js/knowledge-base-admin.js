(function () {
  "use strict";

  var DATA_URL = "assets/data/knowledge-base.json";
  var PUBLISH_URL = "/api/admin/videos";
  var UPLOAD_URL = "/api/admin/uploads";
  var DRAFT_KEY = "legitbodyfix.knowledgeBaseDraft.v1";
  var list = document.getElementById("knowledgeList");
  if (!list) return;

  var status = document.getElementById("knowledgeStatus");
  var search = document.getElementById("knowledgeSearch");
  var publishButton = document.getElementById("publishKnowledge");
  var resetButton = document.getElementById("resetKnowledgeDraft");
  var addButton = document.getElementById("addKnowledgeRecord");
  var tabs = Array.prototype.slice.call(document.querySelectorAll("[data-knowledge-type]"));
  var muscleNavigator = document.getElementById("adminMuscleNavigator");
  var adminMuscleRegions = document.getElementById("adminMuscleRegions");
  var adminMuscleActions = document.getElementById("adminMuscleActions");
  var countNodes = {
    conditions: document.getElementById("conditionCount"),
    muscles: document.getElementById("muscleCount"),
    recipes: document.getElementById("recipeCount")
  };
  var activeType = "conditions";
  var data = { conditions: [], muscles: [], recipes: [] };
  var repositoryData = null;
  var started = false;
  var activeAdminMuscleRegion = "all";
  var activeAdminMuscleAction = "all";
  var selectedMuscleId = "";
  var adminRegionLabels = {
    all: "All body areas", "head-neck": "Neck", "shoulder-scapula": "Shoulder & Scapula", "elbow-forearm": "Elbow & Forearm",
    "wrist-hand": "Wrist & Hand", "thoracic-spine": "Thoracic Spine", "lumbar-spine": "Lumbar Spine", "pelvis-hip": "Pelvis & Hip", knee: "Knee", "foot-ankle": "Foot & Ankle"
  };
  var adminRoleSections = [
    { region: "head-neck", roles: ["Neck flexor", "Neck extensor", "Neck lateral flexor", "Neck rotator"] },
    { region: "shoulder-scapula", roles: ["Shoulder flexor", "Shoulder extensor", "Shoulder abductor", "Shoulder adductor", "Shoulder internal rotator", "Shoulder external rotator", "Scapular protractor", "Scapular retractor", "Scapular elevator", "Scapular depressor", "Scapular upward rotator", "Scapular downward rotator"] },
    { region: "elbow-forearm", roles: ["Elbow flexor", "Elbow extensor", "Forearm pronator", "Forearm supinator", "Wrist flexor", "Wrist extensor"] },
    { region: "wrist-hand", roles: ["Finger flexor", "Finger extensor", "Finger abductor", "Finger adductor", "Thumb flexor", "Thumb extensor", "Thumb abductor", "Thumb adductor", "Thumb opposer"] },
    { region: "thoracic-spine", roles: ["Trunk extensor", "Trunk rotator", "Trunk lateral flexor", "Inspiratory muscle", "Expiratory muscle"] },
    { region: "lumbar-spine", roles: ["Trunk flexor", "Trunk extensor", "Trunk rotator", "Trunk lateral flexor"] },
    { region: "pelvis-hip", roles: ["Hip flexor", "Hip extensor", "Hip abductor", "Hip adductor", "Hip internal rotator", "Hip external rotator", "Pelvic floor supporter", "Urinary continence muscle", "Fecal continence muscle"] },
    { region: "knee", roles: ["Hip flexor", "Hip extensor", "Hip abductor", "Hip adductor", "Hip internal rotator", "Hip external rotator", "Knee flexor", "Knee extensor", "Knee internal rotator", "Knee external rotator"] },
    { region: "foot-ankle", roles: ["Ankle dorsiflexor", "Ankle plantarflexor", "Foot invertor", "Foot evertor", "Toe flexor", "Toe extensor"] }
  ];

  var schemas = {
    conditions: [
      ["title", "Guide name", 120], ["pathway", "Content pathway", 40], ["postureCategory", "Posture body-area group", 120], ["conditionCategory", "Condition category", 120], ["bodyRegion", "Body region", 120],
      ["joints", "Related joints", 240], ["tags", "Tags", 400],
      ["summary", "Clinical summary", 800, true], ["tightMuscles", "Commonly tight / overactive", 500],
      ["weakMuscles", "Commonly weak / underactive", 500], ["screening", "Screening signs", 600, true],
      ["sourceName", "Clinical reference name", 300], ["sourceUrl", "Clinical reference URL", 800],
      ["relatedVideoIds", "Related session IDs (comma separated)", 500]
    ],
    muscles: [
      ["title", "Muscle name", 120], ["group", "Anatomical group", 160], ["family", "Muscle family", 160], ["origin", "Origin", 800, true],
      ["insertion", "Insertion", 800, true], ["actions", "Functions and actions", 800, true],
      ["imageAlt", "Image description", 240],
      ["imageCredit", "Image credit", 240], ["imageCreditUrl", "Image source URL (HTTPS)", 800],
      ["bodyMap", "Body map region", 80], ["sourceName", "Anatomy reference name", 240],
      ["sourceUrl", "Anatomy reference URL (HTTPS)", 800],
      ["relatedVideoIds", "Related session IDs (comma separated)", 500]
    ],
    recipes: [
      ["title", "Recipe title", 120], ["pathway", "Content pathway", 40], ["bodyRegion", "Body area", 120], ["time", "Estimated time", 80],
      ["goal", "Public goal", 500, true], ["whenToUse", "Useful starting point when", 800, true], ["equipment", "Equipment", 300],
      ["steps", "Starting sequence", 2400, true], ["dosage", "Suggested dose", 800, true],
      ["reassess", "Reassessment checkpoint", 800, true], ["regression", "Regression", 800, true],
      ["progression", "Progression", 800, true], ["cautions", "Stop / referral guidance", 800, true],
      ["relatedConditions", "Related conditions", 500], ["sourceName", "Exercise reference name", 300], ["sourceUrl", "Exercise reference URL", 800], ["relatedVideoIds", "Related session IDs (comma separated)", 500]
    ]
  };

  function setStatus(message, state) {
    status.textContent = message;
    if (state) status.dataset.state = state;
    else delete status.dataset.state;
  }

  function clone(value) { return JSON.parse(JSON.stringify(value)); }

  function normalizeMuscles(payload) {
    (payload.muscles || []).forEach(function (record) {
      if (!record.actions && record.function) record.actions = record.function;
    });
    ["conditions", "recipes"].forEach(function (type) {
      (payload[type] || []).forEach(function (record) {
        if (!record.pathway) record.pathway = "postural-movement";
      });
    });
    return payload;
  }

  function isDirectAnatomyPhoto(record) {
    var evidence = [record && record.imageUrl, record && record.imageAlt, record && record.imageCredit].join(" ");
    return /cadaver|dissection|specimen|surgical photograph|Gluteus_medius_muscle\.jpg|Anatomist90/i.test(evidence);
  }

  function hasKoreanImageLabels(record) {
    var evidence = [record && record.imageUrl, record && record.imageAlt, record && record.imageCredit, record && record.imageCreditUrl].join(" ");
    return /enko|korean|[\uac00-\ud7af]/i.test(evidence);
  }

  function isChartImage(record) {
    return /1128_Muscles_of_the_Perineum_Common_to_Men_and_Women/i.test(String(record && record.imageUrl || ""));
  }

  function hasUnsuitableMuscleImage(record) {
    return isDirectAnatomyPhoto(record) || hasKoreanImageLabels(record) || isChartImage(record);
  }

  function sanitizeDraftImages(draft, repository) {
    var canonical = new Map((repository.muscles || []).map(function (record) { return [record.id, record]; }));
    (draft.muscles || []).forEach(function (record) {
      if (!hasUnsuitableMuscleImage(record)) return;
      var replacement = canonical.get(record.id);
      if (!replacement || hasUnsuitableMuscleImage(replacement)) return;
      ["imageUrl", "imageAlt", "imageCredit", "imageCreditUrl", "cardImageScale", "cardImagePosition"].forEach(function (key) {
        if (key in replacement) record[key] = replacement[key];
        else delete record[key];
      });
    });
    return draft;
  }

  function slugify(value) {
    return String(value || "record").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "record";
  }

  function adminMuscleRegion(record) {
    var title = String(record.title || "").toLowerCase(), group = String(record.group || "").toLowerCase(), bodyMap = record.bodyMap;
    if (/\b(cervicis|capitis)\b/.test(title) || ["head and neck", "anterior neck", "lateral neck", "suboccipital neck"].indexOf(group) !== -1 || bodyMap === "head-neck") return "head-neck";
    if (["shoulder", "shoulder girdle", "upper back", "chest", "rotator cuff"].indexOf(group) !== -1 || ["shoulder", "chest"].indexOf(bodyMap) !== -1) return "shoulder-scapula";
    if (["upper arm", "forearm"].indexOf(group) !== -1 || ["upper-arm-front", "upper-arm-back", "forearm"].indexOf(bodyMap) !== -1) return "elbow-forearm";
    if (group === "hand") return "wrist-hand";
    if (["thorax", "posterior thorax"].indexOf(group) !== -1 || /thoracis|thoracic|costarum/.test(title)) return "thoracic-spine";
    if (["abdomen", "back", "erector spinae", "deep back"].indexOf(group) !== -1) return "lumbar-spine";
    if (["pelvic diaphragm", "superficial perineum", "deep perineum", "pelvic sphincters", "hip and pelvis", "deep hip", "medial thigh"].indexOf(group) !== -1) return "pelvis-hip";
    if (["anterior thigh", "posterior thigh"].indexOf(group) !== -1 || title === "popliteus") return "knee";
    if (["anterior lower leg", "lateral lower leg", "posterior lower leg", "foot"].indexOf(group) !== -1) return "foot-ankle";
    return "other";
  }

  function adminActionMatches(record, role) {
    if (role === "all") return true;
    if (Array.isArray(record.functionalRoles)) return record.functionalRoles.indexOf(role) !== -1;
    var region = adminMuscleRegion(record);
    if (/^(Finger|Thumb|Wrist) /.test(role) && ["elbow-forearm", "wrist-hand"].indexOf(region) === -1) return false;
    if (/^(Ankle|Foot|Toe) /.test(role) && region !== "foot-ankle") return false;
    if (/^Trunk /.test(role) && ["thoracic-spine", "lumbar-spine"].indexOf(region) === -1) return false;
    var actions = String(record.actions || record.function || "").toLowerCase();
    var words = role.toLowerCase().replace(/ muscle$/, "").split(" ");
    var joint = words[0], movement = words.slice(1).join(" ");
    var aliases = { flexor: /flex(?:es|ion)/, extensor: /extend|extends|extension/, "lateral flexor": /lateral(?:ly)? flex/, abductor: /abduct/, adductor: /adduct/, "internal rotator": /medial(?:ly)? rotat|internal rotation/, "external rotator": /lateral(?:ly)? rotat|external rotation/, "upward rotator": /upward(?:ly)? rotat/, "downward rotator": /downward(?:ly)? rotat/, rotator: /rotat/, protractor: /protract/, retractor: /retract/, elevator: /elevat/, depressor: /depress/, pronator: /pronat/, supinator: /supinat/, dorsiflexor: /dorsiflex/, plantarflexor: /plantarflex/, invertor: /invert|inversion/, evertor: /evert|eversion/, supporter: /support|stabiliz/, continence: /continence|urethr|anal canal|anorectal/, opposer: /oppos/ };
    var pattern = aliases[movement] || aliases[words[words.length - 1]] || new RegExp(movement.replace(/[^a-z ]/g, ""));
    var jointPattern = joint === "neck" ? /neck|cervical|(?:the|of the) head/ : joint === "trunk" ? /trunk|spine|vertebral|lumbar/ : ["pelvic", "urinary", "fecal"].indexOf(joint) !== -1 ? /pelvic|perine|continence|urethr|anal|anorectal/ : new RegExp(joint);
    return jointPattern.test(actions) && pattern.test(actions);
  }

  function adminFunctionalRoles(record) {
    if (Array.isArray(record.functionalRoles)) return record.functionalRoles.slice();
    return Array.from(new Set(adminRoleSections.flatMap(function (section) { return section.roles; }))).filter(function (role) {
      return adminActionMatches(record, role);
    });
  }

  function makeFunctionalRoleEditor(record) {
    var editor = document.createElement("section");
    editor.className = "muscle-function-editor";
    var heading = document.createElement("div");
    heading.innerHTML = "<div><span class=\"module-chip\">Movement roles</span><h4>Muscle functions</h4></div><p>Add or remove the categories used on the public muscle page.</p>";
    var chips = document.createElement("div");
    chips.className = "muscle-function-chips";
    var controls = document.createElement("div");
    controls.className = "muscle-function-controls";
    var select = document.createElement("select");
    select.setAttribute("aria-label", "Choose a muscle function");
    var add = document.createElement("button");
    add.type = "button"; add.className = "button"; add.textContent = "Add function";
    var allRoles = Array.from(new Set(adminRoleSections.flatMap(function (section) { return section.roles; })));

    function commit(roles) {
      record.functionalRoles = Array.from(new Set(roles));
      saveDraft();
      draw();
    }
    function draw() {
      var roles = adminFunctionalRoles(record);
      chips.textContent = "";
      if (!roles.length) {
        var empty = document.createElement("span"); empty.className = "muscle-function-empty"; empty.textContent = "No movement functions assigned."; chips.appendChild(empty);
      }
      roles.forEach(function (role) {
        var chip = document.createElement("span"); chip.className = "muscle-function-chip";
        chip.appendChild(document.createTextNode(role));
        var remove = document.createElement("button"); remove.type = "button"; remove.setAttribute("aria-label", "Remove " + role); remove.textContent = "×";
        remove.addEventListener("click", function () { commit(roles.filter(function (item) { return item !== role; })); });
        chip.appendChild(remove); chips.appendChild(chip);
      });
      select.textContent = "";
      var available = allRoles.filter(function (role) { return roles.indexOf(role) === -1; });
      var prompt = document.createElement("option"); prompt.value = ""; prompt.textContent = available.length ? "Choose a function…" : "All functions assigned"; select.appendChild(prompt);
      available.forEach(function (role) { var option = document.createElement("option"); option.value = role; option.textContent = role; select.appendChild(option); });
      add.disabled = !available.length;
    }
    add.addEventListener("click", function () { if (select.value) commit(adminFunctionalRoles(record).concat(select.value)); });
    controls.appendChild(select); controls.appendChild(add);
    editor.appendChild(heading); editor.appendChild(chips); editor.appendChild(controls);
    draw();
    return editor;
  }

  function adminMuscleInRegion(record, region) {
    if (region === "all" || adminMuscleRegion(record) === region) return true;
    if ((region === "thoracic-spine" || region === "lumbar-spine") && adminMuscleRegion(record) === "head-neck") return false;
    var rolePrefixes = {
      "head-neck": ["Neck "], "shoulder-scapula": ["Shoulder ", "Scapular "],
      "elbow-forearm": ["Elbow ", "Forearm "], "wrist-hand": ["Wrist ", "Finger ", "Thumb "],
      "thoracic-spine": ["Trunk ", "Inspiratory ", "Expiratory "], "lumbar-spine": ["Trunk "],
      "pelvis-hip": ["Hip ", "Pelvic ", "Urinary ", "Fecal "], knee: ["Knee "],
      "foot-ankle": ["Ankle ", "Foot ", "Toe "]
    };
    return adminRoleSections.flatMap(function (section) { return section.roles; }).some(function (role) {
      return (rolePrefixes[region] || []).some(function (prefix) { return role.indexOf(prefix) === 0; }) && adminActionMatches(record, role);
    });
  }

  function adminMovementFamily(record, role) {
    var title = String(record.title || "").toLowerCase();
    var group = String(record.group || "").toLowerCase();
    var region = adminMuscleRegion(record);
    var family = String(record.family || "").trim();

    if (/^Shoulder /.test(role)) {
      if (/latissimus dorsi|teres major/.test(title)) return "Posterior shoulder movers";
      if (/pectoralis/.test(title)) return "Pectorals";
      if (/deltoid/.test(title)) return "Deltoid";
      if (group === "rotator cuff") return "Rotator cuff";
      if (/biceps brachii|coracobrachialis/.test(title)) return "Anterior arm muscles";
      if (/triceps brachii/.test(title)) return "Posterior arm muscles";
    }
    if (/^Hip /.test(role)) {
      if (/rectus femoris|sartorius/.test(title)) return "Anterior thigh muscles";
      if (/biceps femoris|semitendinosus|semimembranosus/.test(title)) return "Hamstrings";
      if (/adductor|gracilis|pectineus/.test(title)) return "Hip adductors";
    }
    if (/^Knee /.test(role)) {
      if (/rectus femoris|vastus |articularis genus/.test(title)) return "Quadriceps";
      if (/biceps femoris|semitendinosus|semimembranosus/.test(title)) return "Hamstrings";
      if (/sartorius|gracilis/.test(title)) return "Medial knee flexors";
      if (/gastrocnemius|plantaris/.test(title)) return "Calf-assisted knee flexors";
      if (/popliteus/.test(title)) return "Posterior knee rotators";
    }
    if (region === "head-neck") return family || record.group || "Other neck muscles";
    if (region === "shoulder-scapula") {
      if (/trapezius/.test(title)) return "Trapezius";
      if (/rhomboid/.test(title)) return "Rhomboids";
      if (group === "rotator cuff") return "Rotator cuff";
      if (/pectoralis/.test(title)) return "Pectorals";
      if (/deltoid/.test(title)) return "Deltoid";
      if (/serratus anterior/.test(title)) return "Scapular protractors";
      if (/latissimus dorsi|teres major/.test(title)) return "Posterior shoulder movers";
      return family || "Other shoulder muscles";
    }
    if (region === "elbow-forearm" || region === "wrist-hand") {
      if (/biceps brachii|brachialis|coracobrachialis/.test(title)) return "Anterior arm muscles";
      if (/triceps brachii|anconeus/.test(title)) return "Posterior arm muscles";
      if (/brachioradialis|extensor carpi radialis/.test(title)) return "Lateral forearm muscles";
      if (/pronator teres|flexor carpi|palmaris longus|flexor digitorum superficialis/.test(title)) return "Superficial flexor-pronator compartment";
      if (/flexor digitorum profundus|flexor pollicis longus|pronator quadratus/.test(title)) return "Deep flexor-pronator compartment";
      if (/extensor carpi ulnaris|extensor digitorum$|extensor digiti minimi/.test(title)) return "Superficial extensor compartment";
      if (/supinator|abductor pollicis longus|extensor pollicis|extensor indicis/.test(title)) return "Deep extensor-supinator compartment";
      if (/pollicis/.test(title)) return "Thenar muscles";
      if (/digiti minimi|palmaris brevis/.test(title)) return "Hypothenar muscles";
      if (/lumbrical/.test(title)) return "Hand lumbricals";
      if (/interossei/.test(title)) return "Hand interossei";
      return family || "Other arm and hand muscles";
    }
    if (region === "thoracic-spine" || region === "lumbar-spine") {
      if (/rectus abdominis|oblique|transversus abdominis|pyramidalis/.test(title)) return "Abdominal wall";
      if (/iliocostalis|longissimus|spinalis/.test(title)) return "Erector spinae";
      if (/semispinalis|multifidus|rotatores/.test(title)) return "Transversospinalis muscles";
      if (/interspinales|intertransversarii/.test(title)) return "Segmental spinal stabilizers";
      if (/diaphragm/.test(title)) return "Diaphragm";
      if (/intercostals/.test(title)) return "Intercostal muscles";
      return family || "Other trunk muscles";
    }
    if (region === "pelvis-hip") {
      if (/gluteus/.test(title)) return "Gluteal muscles";
      if (/psoas|iliacus/.test(title)) return "Iliopsoas group";
      if (/tensor fasciae latae/.test(title)) return "Lateral hip stabilizers";
      if (group === "deep hip") return "Deep hip rotators";
      if (group === "medial thigh") return "Hip adductors";
      if (/biceps femoris|semitendinosus|semimembranosus/.test(title)) return "Hamstrings";
      if (/levator ani|puborectalis|pubococcygeus|iliococcygeus/.test(title)) return "Levator ani group";
      if (/coccygeus/.test(title)) return "Posterior pelvic diaphragm";
      if (/urethral sphincter|compressor urethrae|urethrovaginal sphincter/.test(title)) return "Urethral sphincter complex";
      if (/anal sphincter/.test(title)) return "Anal sphincter complex";
      if (group === "deep perineum") return "Deep perineal muscles";
      if (group === "superficial perineum") return "Superficial perineal muscles";
      return family || "Other hip and pelvic muscles";
    }
    if (region === "knee") return family || "Other knee muscles";
    if (region === "foot-ankle") {
      if (group === "anterior lower leg") return "Anterior leg compartment";
      if (group === "lateral lower leg") return "Lateral leg compartment";
      if (/gastrocnemius|soleus|plantaris/.test(title)) return "Superficial posterior leg compartment";
      if (/tibialis posterior|flexor hallucis longus|flexor digitorum longus/.test(title)) return "Deep posterior leg compartment";
      if (/extensor digitorum brevis|extensor hallucis brevis/.test(title)) return "Dorsal intrinsic foot muscles";
      if (/hallucis/.test(title)) return "Great-toe intrinsic muscles";
      if (/digiti minimi/.test(title)) return "Fifth-toe intrinsic muscles";
      if (/flexor digitorum brevis|quadratus plantae|lumbricals of the foot/.test(title)) return "Central plantar muscles";
      if (/interossei/.test(title)) return "Foot interossei";
      return family || "Other ankle and foot muscles";
    }
    return family || record.group || "Other muscles";
  }

  function renderAdminMuscleNavigator() {
    if (!muscleNavigator) return;
    muscleNavigator.hidden = activeType !== "muscles";
    if (activeType !== "muscles") return;
    var regions = Object.keys(adminRegionLabels).map(function (region) {
      var count = region === "all" ? data.muscles.length : data.muscles.filter(function (record) { return adminMuscleInRegion(record, region); }).length;
      var button = document.createElement("button");
      button.type = "button"; button.className = activeAdminMuscleRegion === region ? "is-active" : ""; button.textContent = adminRegionLabels[region] + " · " + count;
      button.textContent = adminRegionLabels[region] + " · " + count;
      button.addEventListener("click", function () { activeAdminMuscleRegion = region; activeAdminMuscleAction = "all"; render(); });
      return button;
    });
    adminMuscleRegions.replaceChildren.apply(adminMuscleRegions, regions);
    var roles = Array.from(new Set(adminRoleSections.filter(function (section) { return activeAdminMuscleRegion === "all" || section.region === activeAdminMuscleRegion; }).flatMap(function (section) { return section.roles; })));
    var all = document.createElement("button"); all.type = "button"; all.className = activeAdminMuscleAction === "all" ? "is-active" : ""; all.textContent = "All movements";
    all.addEventListener("click", function () { activeAdminMuscleAction = "all"; render(); });
    var actions = [all].concat(roles.map(function (role) {
      var button = document.createElement("button"); button.type = "button"; button.className = activeAdminMuscleAction === role ? "is-active" : ""; button.textContent = role.replace(/ muscle$/, "");
      button.addEventListener("click", function () { activeAdminMuscleAction = role; render(); });
      return button;
    }));
    adminMuscleActions.replaceChildren.apply(adminMuscleActions, actions);
  }

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    updateCounts();
    setStatus("Draft saved in this browser. Publish when ready.", "draft");
  }

  function updateCounts() {
    Object.keys(countNodes).forEach(function (type) { if (countNodes[type]) countNodes[type].textContent = data[type].length; });
    var sidebar = document.getElementById("sidebarKnowledgeCount");
    if (sidebar) sidebar.textContent = data.conditions.length + data.muscles.length + data.recipes.length;
  }

  function makeField(record, definition) {
    var name = definition[0];
    var label = document.createElement("label");
    label.className = "field" + (definition[3] ? " field-wide" : "");
    var caption = document.createElement("span");
    caption.textContent = definition[1];
    var input;
    if (name === "pathway") {
      input = document.createElement("select");
      [
        ["postural-movement", "Postural & movement issues"],
        ["musculoskeletal-condition", "Musculoskeletal conditions & injuries"]
      ].forEach(function (entry) {
        var option = document.createElement("option");
        option.value = entry[0];
        option.textContent = entry[1];
        input.appendChild(option);
      });
    } else input = definition[3] ? document.createElement("textarea") : document.createElement("input");
    if (definition[3]) input.rows = name === "steps" ? 7 : 4;
    else if (name !== "pathway") input.type = "text";
    input.name = name;
    if (name !== "pathway") input.maxLength = definition[2];
    input.value = record[name] || (name === "pathway" ? "postural-movement" : "");
    input.addEventListener("input", function () {
      record[name] = input.value;
      if (name === "title") {
        var heading = label.closest(".knowledge-card").querySelector("h3");
        heading.textContent = input.value || "Untitled record";
      }
      saveDraft();
    });
    label.appendChild(caption);
    label.appendChild(input);
    return label;
  }

  function imagePosition(record) {
    var match = String(record.cardImagePosition || "50% 50%").match(/([\d.]+)%\s+([\d.]+)%/);
    return match ? { x: Number(match[1]), y: Number(match[2]) } : { x: 50, y: 50 };
  }

  function makeImageStudio(record) {
    var studio = document.createElement("section");
    studio.className = "muscle-image-studio";
    studio.setAttribute("aria-label", "Thumbnail editor for " + (record.title || "muscle"));

    var stage = document.createElement("div");
    stage.className = "muscle-image-stage";
    var image = document.createElement("img");
    image.alt = record.imageAlt || "Thumbnail preview";
    image.loading = "lazy";
    var target = document.createElement("span");
    target.className = "muscle-image-target";
    target.textContent = "TARGET · " + (record.title || "MUSCLE").toUpperCase();
    var empty = document.createElement("div");
    empty.className = "muscle-image-empty";
    empty.innerHTML = "<strong>No usable image</strong><span>Paste an HTTPS image URL below to start framing.</span>";
    stage.appendChild(image);
    stage.appendChild(empty);
    stage.appendChild(target);

    var controls = document.createElement("div");
    controls.className = "muscle-image-controls";
    var heading = document.createElement("div");
    heading.className = "muscle-image-heading";
    heading.innerHTML = "<div><span class=\"module-chip\">Visual editor</span><h4>Frame the public thumbnail</h4></div><p>Adjust the crop without editing the source file.</p>";

    var uploadPanel = document.createElement("div");
    uploadPanel.className = "muscle-image-upload";
    var fileInput = document.createElement("input");
    fileInput.type = "file"; fileInput.accept = "image/jpeg,image/png,image/webp"; fileInput.hidden = true;
    var choose = document.createElement("button");
    choose.type = "button"; choose.className = "button button-dark"; choose.textContent = "Upload new image";
    var uploadStatus = document.createElement("span");
    uploadStatus.textContent = "JPG, PNG or WebP · max 10 MB";
    uploadPanel.appendChild(fileInput); uploadPanel.appendChild(choose); uploadPanel.appendChild(uploadStatus);

    var advanced = document.createElement("details");
    advanced.className = "muscle-image-advanced";
    var advancedSummary = document.createElement("summary");
    advancedSummary.textContent = "Crop adjustments";
    var advancedBody = document.createElement("div");
    advancedBody.className = "muscle-image-advanced-body";
    var urlLabel = document.createElement("label");
    urlLabel.className = "field muscle-image-url";
    urlLabel.innerHTML = "<span>Image URL</span>";
    var urlInput = document.createElement("input");
    urlInput.type = "url";
    urlInput.placeholder = "https://…";
    urlInput.value = record.imageUrl || "";
    urlInput.maxLength = 800;
    urlLabel.appendChild(urlInput);
    var linkPanel = document.createElement("div");
    linkPanel.className = "muscle-image-link";
    var applyLink = document.createElement("button");
    applyLink.type = "button"; applyLink.className = "button"; applyLink.textContent = "Use image link";
    var linkStatus = document.createElement("span");
    linkStatus.setAttribute("aria-live", "polite");
    linkPanel.appendChild(urlLabel); linkPanel.appendChild(applyLink); linkPanel.appendChild(linkStatus);

    var scaleLabel = document.createElement("label");
    scaleLabel.className = "muscle-image-range";
    var scaleValue = document.createElement("output");
    scaleLabel.innerHTML = "<span>Zoom</span>";
    scaleLabel.appendChild(scaleValue);
    var scaleInput = document.createElement("input");
    scaleInput.type = "range";
    scaleInput.min = "1";
    scaleInput.max = "3";
    scaleInput.step = ".05";
    scaleInput.value = String(Number(record.cardImageScale) >= 1 ? Number(record.cardImageScale) : 1);
    scaleLabel.appendChild(scaleInput);

    var position = imagePosition(record);
    function rangeControl(labelText, value) {
      var label = document.createElement("label");
      label.className = "muscle-image-range";
      var output = document.createElement("output");
      label.innerHTML = "<span>" + labelText + "</span>";
      label.appendChild(output);
      var input = document.createElement("input");
      input.type = "range"; input.min = "0"; input.max = "100"; input.step = "1"; input.value = String(value);
      label.appendChild(input);
      return { label: label, input: input, output: output };
    }
    var horizontal = rangeControl("Horizontal focus", position.x);
    var vertical = rangeControl("Vertical focus", position.y);

    var footer = document.createElement("div");
    footer.className = "muscle-image-footer";
    var source = document.createElement("a");
    source.className = "button button-quiet"; source.target = "_blank"; source.rel = "noopener"; source.textContent = "Open original ↗";
    var reset = document.createElement("button");
    reset.className = "button button-quiet"; reset.type = "button"; reset.textContent = "Reset framing";
    footer.appendChild(source); footer.appendChild(reset);

    function update(shouldSave) {
      var src = urlInput.value.trim();
      var scale = Number(scaleInput.value);
      var x = Number(horizontal.input.value), y = Number(vertical.input.value);
      image.hidden = !src;
      empty.hidden = !!src;
      target.hidden = !src;
      if (src && image.getAttribute("src") !== src) image.src = src;
      image.style.transform = "scale(" + scale + ")";
      image.style.transformOrigin = x + "% " + y + "%";
      scaleValue.value = scale.toFixed(2) + "×";
      horizontal.output.value = x + "%";
      vertical.output.value = y + "%";
      source.href = src || "#";
      source.setAttribute("aria-disabled", src ? "false" : "true");
      if (shouldSave) {
        record.imageUrl = src;
        record.cardImageScale = scale;
        record.cardImagePosition = x + "% " + y + "%";
        saveDraft();
      }
    }
    image.addEventListener("load", function () { studio.classList.remove("has-image-error"); empty.hidden = true; image.hidden = false; });
    image.addEventListener("error", function () { studio.classList.add("has-image-error"); empty.hidden = false; empty.querySelector("strong").textContent = "Image could not be loaded"; empty.querySelector("span").textContent = "Check the URL, permissions, or hotlink restrictions."; image.hidden = true; });
    [scaleInput, horizontal.input, vertical.input].forEach(function (input) { input.addEventListener("input", function () { studio.classList.remove("has-image-error"); update(true); }); });
    function useImageLink() {
      var candidate = urlInput.value.trim();
      if (!/^https:\/\//i.test(candidate)) {
        linkStatus.textContent = "Paste a complete HTTPS image link.";
        linkStatus.dataset.state = "error";
        return;
      }
      delete linkStatus.dataset.state;
      studio.classList.remove("has-image-error");
      update(true);
      linkStatus.textContent = "Link applied. Publish guides when ready.";
      linkStatus.dataset.state = "success";
    }
    applyLink.addEventListener("click", useImageLink);
    urlInput.addEventListener("keydown", function (event) { if (event.key === "Enter") { event.preventDefault(); useImageLink(); } });
    reset.addEventListener("click", function () { scaleInput.value = "1"; horizontal.input.value = "50"; vertical.input.value = "50"; update(true); });

    choose.addEventListener("click", function () { fileInput.click(); });
    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      var type = String(file.type || "").toLowerCase();
      if (["image/jpeg", "image/png", "image/webp"].indexOf(type) === -1 || file.size < 1 || file.size > 10 * 1024 * 1024) {
        uploadStatus.textContent = "Use a JPG, PNG or WebP file up to 10 MB.";
        uploadStatus.dataset.state = "error";
        return;
      }
      choose.disabled = true;
      uploadStatus.textContent = "Preparing upload…";
      delete uploadStatus.dataset.state;
      var details;
      fetch(UPLOAD_URL, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, contentType: type, size: file.size, kind: "thumbnail" }) })
        .then(function (response) { return response.json().catch(function () { return {}; }).then(function (body) { if (!response.ok) { var error = new Error(body.error || "upload_failed"); error.status = response.status; error.code = body.error; throw error; } return body; }); })
        .then(function (result) { details = result; uploadStatus.textContent = "Uploading " + file.name + "…"; return fetch(result.uploadUrl, { method: "PUT", headers: { "Content-Type": result.contentType }, body: file }); })
        .then(function (response) { if (!response.ok) throw new Error("upload_rejected"); urlInput.value = details.assetUrl; record.imageUrl = details.assetUrl; fileInput.value = ""; update(true); uploadStatus.textContent = "Uploaded. Publish guides when ready."; uploadStatus.dataset.state = "success"; })
        .catch(function (error) { uploadStatus.textContent = error.status === 401 ? "Session expired. Sign in again." : error.code === "uploads_disabled_in_preview" ? "Uploads work on the production admin page." : "Upload failed. Try again."; uploadStatus.dataset.state = "error"; })
        .finally(function () { choose.disabled = false; });
    });

    controls.appendChild(heading); controls.appendChild(uploadPanel); controls.appendChild(linkPanel);
    var ranges = document.createElement("div"); ranges.className = "muscle-image-ranges";
    ranges.appendChild(scaleLabel); ranges.appendChild(horizontal.label); ranges.appendChild(vertical.label);
    advancedBody.appendChild(ranges); advancedBody.appendChild(footer);
    advanced.appendChild(advancedSummary); advanced.appendChild(advancedBody); controls.appendChild(advanced);
    studio.appendChild(stage); studio.appendChild(controls);
    update(false);
    return studio;
  }

  function muscleImageState(record) {
    var url = String(record.imageUrl || "").trim();
    var description = String(record.imageAlt || "").toLowerCase();
    if (!url) return { key: "missing", label: "Image missing" };
    if (isDirectAnatomyPhoto(record)) return { key: "regional", label: "Direct photo / replace" };
    if (hasKoreanImageLabels(record)) return { key: "regional", label: "Korean labels / replace" };
    if (/\.gif(?:$|\?)/i.test(url)) return { key: "animated", label: "Animated GIF" };
    if (/%E2%80%94%20musculus%20/i.test(url)) return { key: "regional", label: "Line highlight / review" };
    if (isChartImage(record)) return { key: "regional", label: "Chart / replace" };
    var matchingImageCount = data.muscles.filter(function (item) {
      return String(item.imageUrl || "").trim() === url;
    }).length;
    if (matchingImageCount > 1) return { key: "regional", label: "Shared reference" };
    if (/regional|reference|group|plate/.test(description) && description.indexOf(String(record.title || "").toLowerCase()) === -1) return { key: "regional", label: "Regional reference" };
    return { key: "ready", label: "Image ready" };
  }

  function renderMuscleBoard(visible) {
    var boardHeader = document.createElement("div");
    boardHeader.className = "muscle-board-heading";
    var issueCount = visible.filter(function (record) { return muscleImageState(record).key !== "ready"; }).length;
    boardHeader.innerHTML = "<div><span class=\"module-chip\">Image board</span><h3>Review the atlas visually</h3></div><p><strong>" + issueCount + "</strong> cards may need attention. Select any card to edit.</p>";
    list.appendChild(boardHeader);
    var board = document.createElement("div");
    board.className = "muscle-image-board";
    visible.forEach(function (record) {
      var state = muscleImageState(record);
      var button = document.createElement("button");
      button.type = "button"; button.className = "muscle-board-card"; button.dataset.imageState = state.key;
      var visual = document.createElement("span"); visual.className = "muscle-board-visual";
      if (record.imageUrl) {
        var image = document.createElement("img"); image.src = record.imageUrl; image.alt = ""; image.loading = "lazy";
        if (Number(record.cardImageScale) > 1) image.style.transform = "scale(" + Number(record.cardImageScale) + ")";
        image.style.transformOrigin = record.cardImagePosition || "50% 50%";
        image.addEventListener("error", function () { button.dataset.imageState = "missing"; badge.textContent = "Load failed"; visual.classList.add("is-missing"); });
        visual.appendChild(image);
      } else { visual.classList.add("is-missing"); visual.textContent = "NO IMAGE"; }
      var badge = document.createElement("span"); badge.className = "muscle-board-badge"; badge.textContent = state.label;
      var copy = document.createElement("span"); copy.className = "muscle-board-copy";
      var group = document.createElement("small"); group.textContent = record.group || "Muscle";
      var title = document.createElement("strong"); title.textContent = record.title || "Untitled muscle";
      copy.appendChild(group); copy.appendChild(title);
      button.appendChild(visual); button.appendChild(badge); button.appendChild(copy);
      button.addEventListener("click", function () { selectedMuscleId = record.id; render(); window.scrollTo({ top: list.offsetTop - 90, behavior: "smooth" }); });
      board.appendChild(button);
    });
    list.appendChild(board);
  }

  function render() {
    list.textContent = "";
    var query = search.value.trim().toLowerCase();
    renderAdminMuscleNavigator();
    var visible = data[activeType].filter(function (record) {
      if (activeType === "muscles" && !adminMuscleInRegion(record, activeAdminMuscleRegion)) return false;
      if (activeType === "muscles" && !adminActionMatches(record, activeAdminMuscleAction)) return false;
      return !query || JSON.stringify(record).toLowerCase().indexOf(query) !== -1;
    });
    if (activeType === "muscles" && !selectedMuscleId) {
      renderMuscleBoard(visible);
      list.setAttribute("aria-busy", "false");
      updateCounts();
      return;
    }
    if (activeType === "muscles" && selectedMuscleId) {
      visible = data.muscles.filter(function (record) { return record.id === selectedMuscleId; });
      var back = document.createElement("button");
      back.type = "button"; back.className = "button muscle-board-back"; back.textContent = "← Back to image board";
      back.addEventListener("click", function () { selectedMuscleId = ""; render(); });
      list.appendChild(back);
    }
    if (activeType === "muscles" && activeAdminMuscleAction !== "all") {
      visible.sort(function (left, right) {
        return adminMovementFamily(left, activeAdminMuscleAction).localeCompare(adminMovementFamily(right, activeAdminMuscleAction)) || String(left.title || "").localeCompare(String(right.title || ""));
      });
    }
    var previousFamily = "";
    visible.forEach(function (record) {
      var currentFamily = activeType === "muscles" && activeAdminMuscleAction !== "all" ? adminMovementFamily(record, activeAdminMuscleAction) : "";
      if (currentFamily && currentFamily !== previousFamily) {
        var familyHeading = document.createElement("div");
        familyHeading.className = "admin-muscle-family-heading";
        var familyLabel = document.createElement("span");
        familyLabel.textContent = "Muscle family";
        var familyTitle = document.createElement("strong");
        familyTitle.textContent = currentFamily;
        familyHeading.appendChild(familyLabel);
        familyHeading.appendChild(familyTitle);
        list.appendChild(familyHeading);
        previousFamily = currentFamily;
      }
      var card = document.createElement("article");
      card.className = "knowledge-card";
      var header = document.createElement("header");
      var headingWrap = document.createElement("div");
      var eyebrow = document.createElement("span");
      eyebrow.className = "module-chip";
      eyebrow.textContent = activeType.slice(0, -1);
      var heading = document.createElement("h3");
      heading.textContent = record.title || "Untitled record";
      headingWrap.appendChild(eyebrow);
      headingWrap.appendChild(heading);
      var actions = document.createElement("div");
      actions.className = "row-actions";
      var publishLabel = document.createElement("label");
      publishLabel.className = "knowledge-publish-toggle";
      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = record.published === true;
      checkbox.addEventListener("change", function () { record.published = checkbox.checked; saveDraft(); });
      publishLabel.appendChild(checkbox);
      publishLabel.appendChild(document.createTextNode(" Published"));
      var remove = document.createElement("button");
      remove.className = "button button-quiet";
      remove.type = "button";
      remove.textContent = "Remove";
      remove.addEventListener("click", function () {
        data[activeType] = data[activeType].filter(function (item) { return item !== record; });
        saveDraft(); render();
      });
      actions.appendChild(publishLabel);
      actions.appendChild(remove);
      header.appendChild(headingWrap);
      header.appendChild(actions);
      var fields = document.createElement("div");
      fields.className = "form-grid knowledge-fields";
      schemas[activeType].forEach(function (definition) { fields.appendChild(makeField(record, definition)); });
      card.appendChild(header);
      if (activeType === "muscles") { card.appendChild(makeImageStudio(record)); card.appendChild(makeFunctionalRoleEditor(record)); }
      card.appendChild(fields);
      list.appendChild(card);
    });
    if (!visible.length) {
      var empty = document.createElement("div");
      empty.className = "knowledge-empty";
      var emptyTitle = document.createElement("strong");
      var emptyMessage = document.createElement("span");
      emptyTitle.textContent = "No matching records.";
      emptyMessage.textContent = "Add a record or try another search.";
      empty.appendChild(emptyTitle);
      empty.appendChild(emptyMessage);
      list.appendChild(empty);
    }
    list.setAttribute("aria-busy", "false");
    updateCounts();
  }

  function uniqueId(title) {
    var base = slugify(title), candidate = base, number = 2;
    while (data[activeType].some(function (item) { return item.id === candidate; })) candidate = base + "-" + number++;
    return candidate;
  }

  function addRecord() {
    var labels = { conditions: "New movement pattern", muscles: "New muscle", recipes: "New correction recipe" };
    var record = { id: uniqueId(labels[activeType]), title: labels[activeType], published: false };
    if (activeType === "conditions" || activeType === "recipes") record.pathway = "postural-movement";
    schemas[activeType].forEach(function (definition) { if (!(definition[0] in record)) record[definition[0]] = ""; });
    data[activeType].push(record);
    search.value = "";
    saveDraft(); render();
    list.querySelector("input[name=title]").focus();
  }

  function load() {
    if (started) return;
    started = true;
    fetch(DATA_URL, { cache: "no-cache" }).then(function (response) {
      if (!response.ok) throw new Error("Knowledge data could not be loaded.");
      return response.json();
    }).then(function (loaded) {
      repositoryData = normalizeMuscles(clone(loaded));
      var saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        try { data = sanitizeDraftImages(normalizeMuscles(JSON.parse(saved)), repositoryData); localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); setStatus("Browser draft restored. Direct photos, Korean-labeled images, and chart thumbnails were replaced with current repository illustrations.", "draft"); }
        catch (error) { data = clone(repositoryData); localStorage.removeItem(DRAFT_KEY); }
      } else data = clone(repositoryData);
      render();
      if (!saved) setStatus("Knowledge base loaded. Start editing to create a private draft.");
    }).catch(function () { setStatus("The knowledge base could not be loaded. Refresh and try again.", "error"); });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activeType = tab.dataset.knowledgeType;
      selectedMuscleId = "";
      tabs.forEach(function (item) { var selected = item === tab; item.classList.toggle("is-active", selected); item.setAttribute("aria-selected", selected ? "true" : "false"); });
      render();
    });
  });
  search.addEventListener("input", render);
  addButton.addEventListener("click", addRecord);
  resetButton.addEventListener("click", function () { localStorage.removeItem(DRAFT_KEY); data = clone(repositoryData); render(); setStatus("Draft discarded. Repository data restored."); });
  publishButton.addEventListener("click", function () {
    publishButton.disabled = true;
    setStatus("Publishing knowledge base...", "working");
    fetch(PUBLISH_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "publish-knowledge-base", content: data }) }).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (body) { if (!response.ok) { var error = new Error(body.error || "publish_failed"); error.details = body.details; throw error; } return body; });
    }).then(function (result) {
      repositoryData = clone(data); localStorage.removeItem(DRAFT_KEY);
      setStatus(result.unchanged ? "Everything is already published." : "Published successfully. Vercel is updating the live admin.", "success");
    }).catch(function (error) {
      var detail = error.details && error.details[0] ? " " + error.details[0] : "";
      setStatus("Knowledge base could not be published." + detail, "error");
    }).finally(function () { publishButton.disabled = false; });
  });

  window.addEventListener("legitbodyfix:admin-authenticated", load);
  if (!document.getElementById("main").hidden) load();
}());
