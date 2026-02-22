// gigacraft.js
// Финальная версия с улучшенными мобами, барьерами, шкалой голода, возможностью есть,
// атакой, получением урона, бегом на Ctrl, приседанием на Shift, телепортацией при падении,
// улучшенной печью (плавка камня) и сменой камеры по F5 (1-е / 3-е лицо).

// ========== КЕШ DOM ==========
const D = {
    uS: document.getElementById('ui-score'),
    hS: document.getElementById('health-section'),
    aT: document.getElementById('achievement-toast'),
    tN: document.getElementById('toast-name'),
    s1: document.getElementById('slot-1'),
    s2: document.getElementById('slot-2'),
    s3: document.getElementById('slot-3'),
    s4: document.getElementById('slot-4'),
    s5: document.getElementById('slot-5'),
    s6: document.getElementById('slot-6'),
    dS: document.getElementById('screen-death'),
    dSt: document.getElementById('death-stats'),
    aL: document.getElementById('achievements-list'),
    aM: document.getElementById('achievements-menu'),
    iM: document.getElementById('inventory-menu'),
    iL: document.getElementById('inventory-list'),
    closeInv: document.getElementById('close-inventory'),
    craftSlot1: document.getElementById('craft-slot-1'),
    craftSlot2: document.getElementById('craft-slot-2'),
    craftResult: document.getElementById('craft-result'),
    stS: document.getElementById('screen-start'),
    pS: document.getElementById('screen-pause'),
    mn: document.getElementById('menu'),
    setM: document.getElementById('settings-menu'),
    closeSet: document.getElementById('close-settings'),
    sensInput: document.getElementById('sensitivity'),
    sensSpan: document.getElementById('sens-value'),
    renderInput: document.getElementById('render-distance'),
    renderSpan: document.getElementById('render-value'),
    worldRadios: document.querySelectorAll('input[name="worldSize"]'),
    splash: document.getElementById('splash-screen'),
    splashProgress: document.getElementById('splash-progress'),
    qualitySelect: document.getElementById('quality-select'),
    mainMenu: document.getElementById('main-menu'),
    hungerBar: document.getElementById('hunger-bar'),
    furnaceMenu: document.getElementById('furnace-menu'),
    closeFurnace: document.getElementById('close-furnace'),
    fuelSlot: document.getElementById('fuel-slot'),
    inputSlot: document.getElementById('input-slot'),
    outputSlot: document.getElementById('output-slot'),
    furnaceProgressBar: document.getElementById('furnace-progress-bar')
};

// ========== КОНСТАНТЫ ==========
const C = {
    GRAVITY: 0.025,
    PLAYER_SPEED: 0.06,
    SPRINT_SPEED: 0.25,        // увеличено
    CROUCH_SPEED: 0.03,
    MAX_HORIZONTAL_SPEED: 0.4, // увеличено
    JUMP_FORCE: 0.22,
    JUMP_COOLDOWN: 0.3,
    PLAYER_HEIGHT: 1.8,
    PLAYER_HEIGHT_CROUCH: 1.2,
    MOB_COUNT: 40,
    FRICTION: 0.85,
    AIR_CONTROL: 0.2,
    INTERACT_DISTANCE: 4.0,
    ATTACK_DAMAGE: 10,
    FALL_LIMIT: -20,
    TREE_COUNT: 80,
    BASE_MAP_SIZE: 80,
    DAY_DURATION: 600,
    BEDROCK_LEVEL: -1,
    WORLD_BORDER: 40,
    HEALTH_REGEN_RATE: 0.2,
    HUNGER_DRAIN_RATE: 0.01,
    HUNGER_DAMAGE_THRESHOLD: 5,
    FURNACE_COOK_TIME: 5,
    THIRD_PERSON_DISTANCE: 5,
    THIRD_PERSON_HEIGHT: 2
};

// ========== РЕЦЕПТЫ КРАФТА ==========
const RECIPES = [
    { ingredients: [{ id: 'wood', count: 1 }, { id: 'wood', count: 1 }], result: { id: 'planks', name: 'Доски', count: 2 } },
    { ingredients: [{ id: 'planks', count: 1 }, { id: 'planks', count: 1 }], result: { id: 'stick', name: 'Палка', count: 2 } },
    { ingredients: [{ id: 'stone', count: 1 }, { id: 'stone', count: 1 }], result: { id: 'stone_brick', name: 'Каменная кладка', count: 1 } },
    { ingredients: [{ id: 'dirt', count: 1 }, { id: 'dirt', count: 1 }], result: { id: 'grass', name: 'Дёрн', count: 1 } },
    { ingredients: [{ id: 'slimeball', count: 1 }, { id: 'slimeball', count: 1 }], result: { id: 'slime_block', name: 'Слизневый блок', count: 1 } },
    { ingredients: [{ id: 'mutton', count: 1 }, { id: 'mutton', count: 1 }], result: { id: 'cooked_mutton', name: 'Жареная баранина', count: 1 } },
    { ingredients: [{ id: 'stone_brick', count: 1 }, { id: 'stone_brick', count: 1 }], result: { id: 'stone_brick_double', name: 'Двойная кладка', count: 1 } },
    { ingredients: [{ id: 'rotten_flesh', count: 1 }, { id: 'rotten_flesh', count: 1 }], result: { id: 'leather', name: 'Кожа', count: 1 } },
    { ingredients: [{ id: 'string', count: 1 }, { id: 'string', count: 1 }], result: { id: 'wool', name: 'Шерсть', count: 1 } },
    { ingredients: [{ id: 'stick', count: 1 }, { id: 'stone', count: 1 }], result: { id: 'stone_pickaxe', name: 'Каменная кирка', count: 1 } },
    { ingredients: [{ id: 'wood', count: 1 }, { id: 'stone', count: 1 }], result: { id: 'wood_axe', name: 'Деревянный топор', count: 1 } },
    { ingredients: [{ id: 'wood', count: 1 }, { id: 'dirt', count: 1 }], result: { id: 'mixed', name: 'Грязедерево', count: 1 } },
    { ingredients: [{ id: 'stick', count: 1 }, { id: 'planks', count: 1 }], result: { id: 'wood_sword', name: 'Деревянный меч', count: 1 } },
    { ingredients: [{ id: 'feather', count: 1 }, { id: 'stick', count: 1 }], result: { id: 'arrow', name: 'Стрела', count: 4 } },
    { ingredients: [{ id: 'bone', count: 1 }], result: { id: 'bone_meal', name: 'Костная мука', count: 3 } },
    { ingredients: [{ id: 'raw_beef', count: 1 }], result: { id: 'cooked_beef', name: 'Жареная говядина', count: 1 } },
    { ingredients: [{ id: 'raw_chicken', count: 1 }], result: { id: 'cooked_chicken', name: 'Жареная курица', count: 1 } },
    { ingredients: [{ id: 'stone', count: 2 }], result: { id: 'furnace', name: 'Печь', count: 1 } }
];

// ========== ОСНОВНОЙ КЛАСС ==========
class Game {
    constructor() {
        this.state = {
            gameTime: 0,
            isNight: false,
            paused: true, started: false, menu: false, inventoryOpen: false, settingsOpen: false,
            score: 0, slot: 1,
            player: {
                health: 20,
                maxHealth: 20,
                hunger: 100,
                maxHunger: 100,
                speed: C.PLAYER_SPEED,
                vel: new THREE.Vector3(0, 0, 0),
                yaw: 0, pitch: 0,
                jumpCooldown: 0,
                stats: { kills: 0, damage: 0 },
                isCrouching: false
            },
            input: { f:0, b:0, l:0, r:0, j:0, s:0, c:0 },
            mobs: [], trees: [],
            achievements: [
                { id: 'fk', name: 'Первая кровь', unlocked: false, check: s => s.kills >= 1 },
                { id: 'sl', name: 'Потрошитель', unlocked: false, check: s => s.kills >= 20 },
                { id: 'tn', name: 'Мастер', unlocked: false, check: s => s.score >= 1000 },
                { id: 'sv', name: 'Выживший', unlocked: false, check: s => s.damage > 0 && s.health > 0 }
            ],
            inventory: new Array(6).fill(null),
            craftSlots: [null, null],
            craftResult: null,
            mapSize: 80,
            difficulty: 'normal',
            furnace: {
                fuel: null,
                input: null,
                output: null,
                cookTime: 0,
                active: false
            },
            furnaceOpen: false,
            spawnPoint: { x: 0, y: 0, z: 5 }
        };

        this.mouseSensitivity = 1.0;
        this.performanceQuality = 'medium';
        this.cameraMode = 0; // 0 - первое лицо, 1 - третье лицо
        this.playerModel = null;

        this.v = {
            dir: new THREE.Vector3(),
            move: new THREE.Vector3(),
            side: new THREE.Vector3(),
            knock: new THREE.Vector3(),
            rayOrigin: new THREE.Vector3(),
            rayDir: new THREE.Vector3()
        };

        this.clock = new THREE.Clock();
        this.blocksMap = new Map();

        this.initScene();
        this.initEvents();
        this.run();

        // Загрузочный экран
        this.splashScreen = D.splash;
        this.splashProgress = D.splashProgress;

        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (this.splashProgress) this.splashProgress.style.width = progress + '%';
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => this.hideSplash(), 300);
            }
        }, 150);
    }

    hideSplash() {
        if (this.splashScreen) this.splashScreen.style.display = 'none';
        if (D.mainMenu) D.mainMenu.style.display = 'flex';
    }

    showMainMenu() {
        this.state.paused = true;
        if (D.stS) D.stS.style.display = 'none';
        if (D.mainMenu) D.mainMenu.style.display = 'flex';
        if (D.setM) D.setM.style.display = 'none';
        if (D.pS) D.pS.style.display = 'none';
    }

    showWorldCreation() {
        if (D.mainMenu) D.mainMenu.style.display = 'none';
        if (D.stS) D.stS.style.display = 'flex';
    }

    // ---------- ПОИСК БЛОКОВ ----------
    getBlockBelow(x, z, startY) {
        let foundY = -Infinity;
        const fx = Math.floor(x);
        const fz = Math.floor(z);
        for (let y = Math.floor(startY); y >= -10; y--) {
            const key = `${fx},${y},${fz}`;
            if (this.blocksMap.has(key)) {
                const blockTop = y + 1;
                if (blockTop <= startY && blockTop > foundY) {
                    foundY = blockTop;
                }
            }
        }
        return foundY === -Infinity ? null : foundY;
    }

    isPositionInsideBlock(pos) {
        const x = Math.floor(pos.x);
        const y = Math.floor(pos.y);
        const z = Math.floor(pos.z);
        return this.blocksMap.has(`${x},${y},${z}`);
    }

    ensureSafePosition() {
        if (this.isPositionInsideBlock(this.cam.position)) {
            for (let y = Math.ceil(this.cam.position.y) + 0.5; y < this.cam.position.y + 5; y += 0.5) {
                let testPos = this.cam.position.clone();
                testPos.y = y;
                if (!this.isPositionInsideBlock(testPos)) {
                    this.cam.position.y = y;
                    break;
                }
            }
        }
        for (let t of this.state.trees) {
            const dx = this.cam.position.x - t.position.x;
            const dz = this.cam.position.z - t.position.z;
            const dist = Math.sqrt(dx*dx + dz*dz);
            if (dist < 1.0) {
                const angle = Math.atan2(dz, dx);
                this.cam.position.x = t.position.x + Math.cos(angle) * 1.2;
                this.cam.position.z = t.position.z + Math.sin(angle) * 1.2;
            }
        }
    }

    respawnPlayer() {
        const spawn = this.state.spawnPoint;
        this.cam.position.set(spawn.x, spawn.y, spawn.z);
        this.state.player.vel.set(0, 0, 0);
        this.state.player.health = this.state.player.maxHealth;
        this.state.player.hunger = this.state.player.maxHunger;
        this.state.player.stats.damage = 0;
        this.updateUI();
    }

    clearWorld() {
        const toRemove = [];
        this.scene.traverse(obj => {
            if (obj !== this.scene && obj !== this.cam && obj !== this.hand && !(obj instanceof THREE.Camera) && !(obj instanceof THREE.Light) && obj !== this.sunMesh && obj !== this.moonGroup && obj !== this.playerModel) {
                toRemove.push(obj);
            }
        });
        toRemove.forEach(obj => this.scene.remove(obj));
        this.blocksMap.clear();
        this.state.mobs = [];
        this.state.trees = [];
        this.state.score = 0;
        this.state.player.health = 20;
        this.state.player.hunger = 100;
        this.state.player.stats = { kills: 0, damage: 0 };
        this.state.inventory.fill(null);
        this.state.craftSlots = [null, null];
        this.state.craftResult = null;
        this.state.achievements.forEach(a => a.unlocked = false);
        this.state.gameTime = 0;
        this.state.furnace = { fuel: null, input: null, output: null, cookTime: 0, active: false };
        this.updateUI();
        this.updateInventoryUI();
        this.updateCraftUI();
        this.updateFurnaceUI();
    }

    generateWorld(mapSize) {
        this.state.mapSize = mapSize;
        this.clearWorld();

        if (!this.scene.children.includes(this.ambientLight)) {
            this.ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
            this.scene.add(this.ambientLight);
        }
        if (!this.scene.children.includes(this.sunLight)) {
            this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
            this.sunLight.position.set(50, 100, 50);
            this.scene.add(this.sunLight);
        }

        const geo = new THREE.BoxGeometry(1, 1, 1);
        const matGround = new THREE.MeshStandardMaterial({ color: 0x7c9d8e });
        const matDirt = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
        const matStone = new THREE.MeshStandardMaterial({ color: 0x808080 });
        const matBedrock = new THREE.MeshStandardMaterial({ color: 0x111111 });

        const size = mapSize;
        const center = size / 2;

        // Бедрок
        for (let x = 0; x < size; x++) {
            for (let z = 0; z < size; z++) {
                const px = (x - center) * 1;
                const pz = (z - center) * 1;
                const block = new THREE.Mesh(geo, matBedrock);
                block.position.set(px, C.BEDROCK_LEVEL, pz);
                block.userData = { type: 'bedrock', drop: null, unbreakable: true };
                this.scene.add(block);
                this.blocksMap.set(`${px},${C.BEDROCK_LEVEL},${pz}`, block);
            }
        }

        // Основная генерация
        for (let x = 0; x < size; x++) {
            for (let z = 0; z < size; z++) {
                const px = (x - center) * 1;
                const pz = (z - center) * 1;
                const h = Math.floor(5 + Math.sin(px * 0.2) * 2 + Math.cos(pz * 0.2) * 2);
                for (let y = 0; y <= h; y++) {
                    let material;
                    if (y === h) material = matGround;
                    else if (y > h-3) material = matDirt;
                    else material = matStone;
                    const block = new THREE.Mesh(geo, material);
                    block.position.set(px, y, pz);
                    block.userData = { type: 'block', drop: y === h ? 'dirt' : (y > h-3 ? 'dirt' : 'stone') };
                    this.scene.add(block);
                    this.blocksMap.set(`${px},${y},${pz}`, block);
                }
            }
        }

        // Барьеры
        const barrierMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
        const barrierHeight = 10;
        const barrierThickness = 1;
        const wallGeo = new THREE.BoxGeometry(size, barrierHeight, barrierThickness);
        const northWall = new THREE.Mesh(wallGeo, barrierMat);
        northWall.position.set(0, barrierHeight/2, -center - 0.5);
        northWall.userData = { type: 'barrier', unbreakable: true };
        this.scene.add(northWall);
        const southWall = new THREE.Mesh(wallGeo, barrierMat);
        southWall.position.set(0, barrierHeight/2, center + 0.5);
        southWall.userData = { type: 'barrier', unbreakable: true };
        this.scene.add(southWall);
        const westWall = new THREE.Mesh(new THREE.BoxGeometry(barrierThickness, barrierHeight, size), barrierMat);
        westWall.position.set(-center - 0.5, barrierHeight/2, 0);
        westWall.userData = { type: 'barrier', unbreakable: true };
        this.scene.add(westWall);
        const eastWall = new THREE.Mesh(new THREE.BoxGeometry(barrierThickness, barrierHeight, size), barrierMat);
        eastWall.position.set(center + 0.5, barrierHeight/2, 0);
        eastWall.userData = { type: 'barrier', unbreakable: true };
        this.scene.add(eastWall);

        // Деревья
        let treeCount = C.TREE_COUNT;
        let mobCount = C.MOB_COUNT;
        treeCount = Math.floor(treeCount * (mapSize / 80));
        mobCount = Math.floor(mobCount * (mapSize / 80) * 0.6);

        if (this.performanceQuality === 'low') {
            treeCount = Math.floor(treeCount * 0.3);
            mobCount = Math.floor(mobCount * 0.5);
        } else if (this.performanceQuality === 'medium') {
            treeCount = Math.floor(treeCount * 0.7);
            mobCount = Math.floor(mobCount * 0.8);
        }

        for (let i = 0; i < treeCount; i++) {
            if (Math.random() > 0.3) continue;
            const x = (Math.random() * size - center) | 0;
            const z = (Math.random() * size - center) | 0;
            const h = Math.floor(5 + Math.sin(x * 0.2) * 2 + Math.cos(z * 0.2) * 2) + 0.5;
            const tree = new THREE.Group();
            tree.userData = { type: 'tree' };
            const wood = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
            const leaf = new THREE.MeshStandardMaterial({ color: 0x2e8b57 });
            for (let j = 0; j < 2; j++) {
                const b = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), wood);
                b.position.y = j + 0.5;
                b.userData = { type: 'treePart' };
                tree.add(b);
            }
            const l = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2), leaf);
            l.position.y = 2;
            l.userData = { type: 'treePart' };
            tree.add(l);
            tree.position.set(x, h, z);
            this.scene.add(tree);
            this.state.trees.push(tree);
        }

        // Мобы
        for (let i = 0; i < mobCount; i++) this.spawnMob();

        // Стартовая позиция и спавн
        const startX = 0, startZ = 0;
        const blockY = this.getBlockBelow(startX, startZ, 100);
        const groundY = blockY !== null ? blockY + C.PLAYER_HEIGHT : 20;
        this.cam.position.set(startX, groundY, 5);
        this.state.spawnPoint = { x: startX, y: groundY, z: 5 };
        this.state.player.vel.set(0, 0, 0);
        this.ensureSafePosition();

        // Создание модели игрока
        this.createPlayerModel();

        if (!this.hand.parent) {
            this.hand = new THREE.Group();
            this.cam.add(this.hand);
            this.hand.position.set(0.5, -0.5, -0.5);
            const handCube = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3),
                new THREE.MeshStandardMaterial({ color: 0xffaa00 }));
            this.hand.add(handCube);
        }

        console.log(`Мир ${mapSize}x${mapSize} сгенерирован, мобов: ${mobCount}`);
    }

    createPlayerModel() {
        if (this.playerModel) this.scene.remove(this.playerModel);
        this.playerModel = new THREE.Group();
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3366cc });
        const headMat = new THREE.MeshStandardMaterial({ color: 0xffccaa });
        const armMat = new THREE.MeshStandardMaterial({ color: 0x3366cc });
        const legMat = new THREE.MeshStandardMaterial({ color: 0x224488 });

        // тело
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 0.4), bodyMat);
        body.position.y = 0.8;
        this.playerModel.add(body);
        // голова
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.4), headMat);
        head.position.y = 1.6;
        this.playerModel.add(head);
        // руки
        const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 0.3), armMat);
        leftArm.position.set(-0.6, 1.2, 0);
        this.playerModel.add(leftArm);
        const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 0.3), armMat);
        rightArm.position.set(0.6, 1.2, 0);
        this.playerModel.add(rightArm);
        // ноги
        const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 0.3), legMat);
        leftLeg.position.set(-0.25, 0.3, 0);
        this.playerModel.add(leftLeg);
        const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 0.3), legMat);
        rightLeg.position.set(0.25, 0.3, 0);
        this.playerModel.add(rightLeg);

        // начальное положение (на земле)
        const groundY = this.getBlockBelow(this.cam.position.x, this.cam.position.z, this.cam.position.y) || 0;
        this.playerModel.position.set(this.cam.position.x, groundY, this.cam.position.z);
        this.playerModel.visible = false; // по умолчанию первое лицо
        this.scene.add(this.playerModel);
    }

    createNewWorld() {
        let selectedSize = 80;
        for (let radio of D.worldRadios) {
            if (radio.checked) {
                selectedSize = parseInt(radio.value);
                break;
            }
        }
        const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
        for (let radio of difficultyRadios) {
            if (radio.checked) {
                this.state.difficulty = radio.value;
                break;
            }
        }
        C.BASE_MAP_SIZE = selectedSize;
        C.WORLD_BORDER = selectedSize / 2;

        if (this.splashScreen) this.splashScreen.style.display = 'flex';

        let loadProgress = 0;
        const loadInterval = setInterval(() => {
            loadProgress += 10;
            if (this.splashProgress) this.splashProgress.style.width = loadProgress + '%';
            if (loadProgress >= 100) {
                clearInterval(loadInterval);
                this.generateWorld(selectedSize);
                this.state.started = true;
                this.state.paused = false;
                if (D.stS) D.stS.style.display = 'none';
                if (D.mainMenu) D.mainMenu.style.display = 'none';
                if (this.splashScreen) this.splashScreen.style.display = 'none';
                try {
                    this.ren.domElement.requestPointerLock();
                } catch (e) {
                    console.error('Ошибка запроса блокировки мыши', e);
                }
            }
        }, 150);
    }

    exitToMenu() {
        this.state.paused = true;
        this.state.started = false;
        document.exitPointerLock();
        if (D.stS) D.stS.style.display = 'none';
        if (D.pS) D.pS.style.display = 'none';
        if (D.setM) D.setM.style.display = 'none';
        if (D.mainMenu) D.mainMenu.style.display = 'flex';
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);

        this.cam = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 500);
        this.ren = new THREE.WebGLRenderer({ antialias: false });
        this.ren.setSize(innerWidth, innerHeight);
        this.ren.shadowMap.enabled = false;
        document.body.appendChild(this.ren.domElement);

        this.ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
        this.sunLight.position.set(50, 100, 50);
        this.scene.add(this.ambientLight);
        this.scene.add(this.sunLight);

        this.hand = new THREE.Group();
        this.cam.add(this.hand);
        this.hand.position.set(0.5, -0.5, -0.5);
        const handCube = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3),
            new THREE.MeshStandardMaterial({ color: 0xffaa00 }));
        this.hand.add(handCube);

        const sunGeo = new THREE.SphereGeometry(10, 8, 8);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
        this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
        this.scene.add(this.sunMesh);

        const moonGeo = new THREE.SphereGeometry(8, 8, 8);
        const moonMat = new THREE.MeshBasicMaterial({ color: 0xcccccc });
        this.moonGroup = new THREE.Group();
        this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
        this.moonGroup.add(this.moonMesh);
        this.scene.add(this.moonGroup);
    }

    // ---------- УЛУЧШЕННЫЕ МОДЕЛИ МОБОВ ----------
    createMobModel(type, color, size) {
        const group = new THREE.Group();
        const bodyMat = new THREE.MeshStandardMaterial({ color: color });
        const legMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        const headMat = new THREE.MeshStandardMaterial({ color: type === 'sheep' ? 0xeeeeee : color });

        switch(type) {
            case 'sheep':
                const body = new THREE.Mesh(new THREE.BoxGeometry(size * 1.2, size * 0.8, size * 1.2), bodyMat);
                body.position.y = size * 0.4;
                group.add(body);
                const head = new THREE.Mesh(new THREE.BoxGeometry(size * 0.6, size * 0.6, size * 0.6), headMat);
                head.position.set(0, size * 0.9, size * 0.5);
                group.add(head);
                const legGeo = new THREE.BoxGeometry(size * 0.2, size * 0.5, size * 0.2);
                const legPos = [[-0.4, 0.1, -0.4], [0.4, 0.1, -0.4], [-0.4, 0.1, 0.4], [0.4, 0.1, 0.4]];
                legPos.forEach(pos => {
                    const leg = new THREE.Mesh(legGeo, legMat);
                    leg.position.set(pos[0]*size, pos[1]*size, pos[2]*size);
                    group.add(leg);
                });
                break;

            case 'cow':
                const bodyCow = new THREE.Mesh(new THREE.BoxGeometry(size * 1.4, size * 0.9, size * 1.4), bodyMat);
                bodyCow.position.y = size * 0.45;
                group.add(bodyCow);
                const headCow = new THREE.Mesh(new THREE.BoxGeometry(size * 0.7, size * 0.7, size * 0.7), headMat);
                headCow.position.set(0, size * 0.95, size * 0.6);
                group.add(headCow);
                const legCowGeo = new THREE.BoxGeometry(size * 0.3, size * 0.6, size * 0.3);
                const legCowPos = [[-0.5, 0.15, -0.5], [0.5, 0.15, -0.5], [-0.5, 0.15, 0.5], [0.5, 0.15, 0.5]];
                legCowPos.forEach(pos => {
                    const leg = new THREE.Mesh(legCowGeo, legMat);
                    leg.position.set(pos[0]*size, pos[1]*size, pos[2]*size);
                    group.add(leg);
                });
                break;

            case 'chicken':
                const bodyChicken = new THREE.Mesh(new THREE.BoxGeometry(size * 0.8, size * 0.8, size * 0.8), bodyMat);
                bodyChicken.position.y = size * 0.4;
                group.add(bodyChicken);
                const headChicken = new THREE.Mesh(new THREE.BoxGeometry(size * 0.4, size * 0.4, size * 0.4), headMat);
                headChicken.position.set(0, size * 0.9, size * 0.3);
                group.add(headChicken);
                const legChickenGeo = new THREE.BoxGeometry(size * 0.15, size * 0.5, size * 0.15);
                const legChickenPos = [[-0.25, 0.1, -0.3], [0.25, 0.1, -0.3]];
                legChickenPos.forEach(pos => {
                    const leg = new THREE.Mesh(legChickenGeo, legMat);
                    leg.position.set(pos[0]*size, pos[1]*size, pos[2]*size);
                    group.add(leg);
                });
                break;

            case 'slime':
                const bodySlime = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), bodyMat);
                bodySlime.position.y = size / 2;
                group.add(bodySlime);
                break;

            default:
                const bodyHuman = new THREE.Mesh(new THREE.BoxGeometry(size * 0.8, size * 1.2, size * 0.5), bodyMat);
                bodyHuman.position.y = size * 0.6;
                group.add(bodyHuman);
                const headHuman = new THREE.Mesh(new THREE.BoxGeometry(size * 0.6, size * 0.6, size * 0.6), headMat);
                headHuman.position.set(0, size * 1.2, 0);
                group.add(headHuman);
                const armMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
                const armGeo = new THREE.BoxGeometry(size * 0.3, size * 0.8, size * 0.3);
                const leftArm = new THREE.Mesh(armGeo, armMat);
                leftArm.position.set(-size * 0.6, size * 0.8, 0);
                group.add(leftArm);
                const rightArm = new THREE.Mesh(armGeo, armMat);
                rightArm.position.set(size * 0.6, size * 0.8, 0);
                group.add(rightArm);
                const legHumanGeo = new THREE.BoxGeometry(size * 0.3, size * 0.8, size * 0.3);
                const leftLeg = new THREE.Mesh(legHumanGeo, legMat);
                leftLeg.position.set(-size * 0.3, size * 0.2, 0);
                group.add(leftLeg);
                const rightLeg = new THREE.Mesh(legHumanGeo, legMat);
                rightLeg.position.set(size * 0.3, size * 0.2, 0);
                group.add(rightLeg);
                break;
        }

        if (type !== 'sheep' && type !== 'cow' && type !== 'chicken') {
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const eyeGeo = new THREE.BoxGeometry(0.2, 0.2, 0.1);
            const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
            eye1.position.set(-size * 0.2, size * 0.9, size * 0.3);
            const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
            eye2.position.set(size * 0.2, size * 0.9, size * 0.3);
            group.add(eye1, eye2);
        }

        return group;
    }

    spawnMob() {
        const mobTypes = [
            { type: 'sheep', color: 0xffffff, size: 1.2, speed: 0.05, hp: 30, drops: [{id: 'mutton', count: 2}, {id: 'wool', count: 1}], aggressive: false },
            { type: 'cow', color: 0x8b4513, size: 1.4, speed: 0.06, hp: 40, drops: [{id: 'raw_beef', count: 3}, {id: 'leather', count: 1}], aggressive: false },
            { type: 'chicken', color: 0xffaa00, size: 0.8, speed: 0.08, hp: 15, drops: [{id: 'raw_chicken', count: 2}, {id: 'feather', count: 2}], aggressive: false },
            { type: 'slime', color: 0x55ff55, size: 1.0, speed: 0.1, hp: 100, drops: [{id: 'slimeball', count: 1}], aggressive: false, nightOnly: true },
            { type: 'slime', color: 0xff5555, size: 0.8, speed: 0.15, hp: 30, drops: [{id: 'slimeball', count: 1}], aggressive: false, nightOnly: true },
            { type: 'slime', color: 0x5555ff, size: 2.2, speed: 0.05, hp: 300, drops: [{id: 'slimeball', count: 2}], aggressive: false, nightOnly: true },
            { type: 'zombie', color: 0x006400, size: 1.1, speed: 0.07, hp: 50, drops: [{id: 'rotten_flesh', count: 2}], aggressive: true, nightOnly: true },
            { type: 'skeleton', color: 0xcccccc, size: 1.1, speed: 0.08, hp: 40, drops: [{id: 'bone', count: 2}, {id: 'arrow', count: 2}], aggressive: true, nightOnly: true },
            { type: 'spider', color: 0x2f4f4f, size: 1.2, speed: 0.12, hp: 35, drops: [{id: 'string', count: 2}], aggressive: true, nightOnly: true },
            { type: 'creeper', color: 0x00aa00, size: 1.1, speed: 0.06, hp: 60, drops: [{id: 'gunpowder', count: 2}], aggressive: true, nightOnly: true }
        ];

        const available = mobTypes.filter(m => !m.nightOnly || this.state.isNight);
        if (available.length === 0) return;

        const d = available[Math.floor(Math.random() * available.length)];

        const group = this.createMobModel(d.type, d.color, d.size);

        const angle = Math.random() * Math.PI * 2;
        const rad = 15 + Math.random() * 40;
        const x = Math.cos(angle) * rad;
        const z = Math.sin(angle) * rad;
        const blockY = this.getBlockBelow(x, z, 100);
        const h = blockY !== null ? blockY + 0.5 : 10;
        group.position.set(x, h + d.size / 2, z);

        group.userData = {
            type: d.type,
            hp: d.hp, maxHp: d.hp, size: d.size, speed: d.speed,
            velY: 0, grounded: true, jumpTimer: Math.random() * 2,
            targetDir: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
            drops: d.drops,
            aggressive: d.aggressive
        };

        this.state.mobs.push(group);
        this.scene.add(group);
    }

    // ---------- ОБНОВЛЕНИЕ МОБОВ (только слизи прыгают) ----------
    updateMobs(dt) {
        for (let i = this.state.mobs.length - 1; i >= 0; i--) {
            const mob = this.state.mobs[i];
            const d = mob.userData;
            const blockBelow = this.getBlockBelow(mob.position.x, mob.position.z, mob.position.y + 0.1);
            const groundY = blockBelow !== null ? blockBelow + 0.5 : -Infinity;
            const targetY = groundY !== -Infinity ? groundY + d.size / 2 : -Infinity;

            // Респаун при падении
            if (mob.position.y < -20) {
                this.scene.remove(mob);
                this.state.mobs.splice(i, 1);
                this.spawnMob();
                continue;
            }

            // Агрессивные мобы преследуют игрока
            if (d.aggressive) {
                const distToPlayer = mob.position.distanceTo(this.cam.position);
                if (distToPlayer < 20) {
                    d.targetDir.copy(this.cam.position).sub(mob.position).setY(0).normalize();
                }
                if (distToPlayer < d.size * 2) {
                    const now = Date.now();
                    if (!d.lastAttack || now - d.lastAttack > 1000) {
                        this.damagePlayer(2);
                        d.lastAttack = now;
                    }
                }
            }

            const isSlime = d.type === 'slime';

            if (isSlime) {
                // Слизи прыгают
                if (d.grounded) {
                    d.jumpTimer -= dt;
                    if (d.jumpTimer <= 0) {
                        d.velY = 0.2 + Math.random() * 0.1;
                        d.grounded = false;
                        d.jumpTimer = 1 + Math.random() * 2;
                        if (!d.aggressive && Math.random() < 0.3) {
                            d.targetDir.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
                        }
                    }
                } else {
                    mob.position.addScaledVector(d.targetDir, d.speed);
                }
            } else {
                // Остальные просто ходят
                mob.position.addScaledVector(d.targetDir, d.speed);
                if (targetY !== -Infinity && mob.position.y > targetY + 0.1) {
                    d.velY -= 0.01;
                } else {
                    d.velY = 0;
                    d.grounded = true;
                }
            }

            if (!d.grounded || !isSlime) {
                d.velY -= 0.01;
                mob.position.y += d.velY;
            }

            if (targetY !== -Infinity && mob.position.y < targetY) {
                mob.position.y = targetY;
                d.velY = 0;
                d.grounded = true;
                mob.scale.set(1.3, 0.7, 1.3);
            }
            mob.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        }
    }

    // ---------- ДЕНЬ/НОЧЬ ----------
    updateDayNight(dt) {
        this.state.gameTime = (this.state.gameTime || 0) + dt;
        const progress = (this.state.gameTime % C.DAY_DURATION) / C.DAY_DURATION;
        const angle = progress * Math.PI * 2 - Math.PI / 2;

        const orbitDist = 400;
        const sX = Math.cos(angle) * orbitDist;
        const sY = -Math.sin(angle) * orbitDist;

        this.state.isNight = sY < 0;

        if (this.sunMesh) {
            this.sunMesh.position.set(
                this.cam.position.x + sX,
                this.cam.position.y + sY,
                this.cam.position.z - 100
            );
            this.sunMesh.lookAt(this.cam.position);
        }
        if (this.moonGroup) {
            this.moonGroup.position.set(
                this.cam.position.x - sX,
                this.cam.position.y - sY,
                this.cam.position.z - 100
            );
            this.moonGroup.lookAt(this.cam.position);
        }

        const lightFactor = Math.max(0, sY / orbitDist);
        if (this.sunLight) {
            this.sunLight.intensity = this.state.isNight ? 0.2 : 0.2 + lightFactor;
        }
        if (this.ambientLight) {
            this.ambientLight.intensity = 0.2 + lightFactor * 0.5;
        }

        const dayColor = new THREE.Color(0x87CEEB);
        const nightColor = new THREE.Color(0x050510);
        this.scene.background = dayColor.clone().lerp(nightColor, 1 - lightFactor);
    }

    // ---------- ФИЗИКА ИГРОКА ----------
    update(dt) {
        const s = this.state;
        const p = s.player;
        const inp = s.input;
        const cam = this.cam;

        // Приседание
        p.isCrouching = inp.c === 1;
        const currentHeight = p.isCrouching ? C.PLAYER_HEIGHT_CROUCH : C.PLAYER_HEIGHT;
        let currentSpeed = C.PLAYER_SPEED;
        if (p.isCrouching) currentSpeed = C.CROUCH_SPEED;
        else if (inp.s) currentSpeed = C.SPRINT_SPEED;

        const blockBelow = this.getBlockBelow(cam.position.x, cam.position.z, cam.position.y + 0.1);
        const groundY = blockBelow !== null ? blockBelow + currentHeight : -Infinity;
        const onGround = blockBelow !== null && cam.position.y <= groundY + 0.1;

        const control = onGround ? 1.0 : C.AIR_CONTROL;
        cam.getWorldDirection(this.v.dir);
        const moveDir = this.v.move.copy(this.v.dir).setY(0).normalize();
        const sideDir = this.v.side.crossVectors(new THREE.Vector3(0, 1, 0), moveDir).normalize();

        let wishVel = new THREE.Vector3(0, 0, 0);
        if (inp.f) wishVel.add(moveDir);
        if (inp.b) wishVel.addScaledVector(moveDir, -1);
        if (inp.l) wishVel.add(sideDir);
        if (inp.r) wishVel.addScaledVector(sideDir, -1);
        if (wishVel.lengthSq() > 0) wishVel.normalize();

        const accel = currentSpeed * control;
        wishVel.multiplyScalar(accel * dt * 60);

        p.vel.x += wishVel.x;
        p.vel.z += wishVel.z;

        const horizSpeed = Math.sqrt(p.vel.x * p.vel.x + p.vel.z * p.vel.z);
        if (horizSpeed > C.MAX_HORIZONTAL_SPEED) {
            p.vel.x *= C.MAX_HORIZONTAL_SPEED / horizSpeed;
            p.vel.z *= C.MAX_HORIZONTAL_SPEED / horizSpeed;
        }

        if (onGround) {
            p.vel.x *= C.FRICTION;
            p.vel.z *= C.FRICTION;
        }

        if (p.jumpCooldown > 0) p.jumpCooldown -= dt;
        if (inp.j && onGround && p.jumpCooldown <= 0 && !p.isCrouching) {
            p.vel.y = C.JUMP_FORCE;
            p.jumpCooldown = C.JUMP_COOLDOWN;
        }

        p.vel.y -= C.GRAVITY;

        const oldX = cam.position.x, oldZ = cam.position.z;
        cam.position.x += p.vel.x;
        cam.position.y += p.vel.y;
        cam.position.z += p.vel.z;

        if (this.isPositionInsideBlock(cam.position)) {
            cam.position.x = oldX;
            cam.position.z = oldZ;
            p.vel.x = 0;
            p.vel.z = 0;
        }

        const border = C.WORLD_BORDER;
        if (cam.position.x > border) { cam.position.x = border; p.vel.x = 0; }
        if (cam.position.x < -border) { cam.position.x = -border; p.vel.x = 0; }
        if (cam.position.z > border) { cam.position.z = border; p.vel.z = 0; }
        if (cam.position.z < -border) { cam.position.z = -border; p.vel.z = 0; }

        if (cam.position.y < C.FALL_LIMIT) {
            this.respawnPlayer();
        }

        if (groundY !== -Infinity && cam.position.y < groundY) {
            cam.position.y = groundY;
            p.vel.y = 0;
        }

        for (let t of s.trees) {
            const dx = cam.position.x - t.position.x;
            const dz = cam.position.z - t.position.z;
            const dist = Math.sqrt(dx*dx + dz*dz);
            if (dist < 1.0) {
                const angle = Math.atan2(dz, dx);
                cam.position.x = t.position.x + Math.cos(angle) * 1.0;
                cam.position.z = t.position.z + Math.sin(angle) * 1.0;
                p.vel.x = 0;
                p.vel.z = 0;
            }
        }

        if (Math.abs(p.vel.x) < 0.001) p.vel.x = 0;
        if (Math.abs(p.vel.z) < 0.001) p.vel.z = 0;

        if (this.isPositionInsideBlock(cam.position)) {
            let y = cam.position.y + 0.1;
            while (y < cam.position.y + 2) {
                let testPos = cam.position.clone();
                testPos.y = y;
                if (!this.isPositionInsideBlock(testPos)) {
                    cam.position.y = y;
                    break;
                }
                y += 0.1;
            }
        }

        // Обновление позиции модели игрока (ставим на землю)
        if (this.playerModel) {
            const modelGroundY = this.getBlockBelow(cam.position.x, cam.position.z, cam.position.y) || 0;
            this.playerModel.position.set(cam.position.x, modelGroundY, cam.position.z);
        }

        // Регенерация здоровья
        if (p.health < p.maxHealth) {
            p.health = Math.min(p.maxHealth, p.health + C.HEALTH_REGEN_RATE * dt);
        }

        // Голод
        p.hunger = Math.max(0, p.hunger - C.HUNGER_DRAIN_RATE * dt);
        if (p.hunger <= C.HUNGER_DAMAGE_THRESHOLD) {
            this.damagePlayer(0.5 * dt);
        }

        // Работа печи (с поддержкой камня)
        if (this.state.furnace.input && this.state.furnace.fuel) {
            this.state.furnace.cookTime += dt;
            if (this.state.furnace.cookTime >= C.FURNACE_COOK_TIME) {
                const inputId = this.state.furnace.input.id;
                let outputId;
                if (inputId === 'raw_beef') outputId = 'cooked_beef';
                else if (inputId === 'raw_chicken') outputId = 'cooked_chicken';
                else if (inputId === 'mutton') outputId = 'cooked_mutton';
                else if (inputId === 'stone') outputId = 'stone_brick';
                else outputId = inputId;

                this.state.furnace.output = { id: outputId, name: this.getItemName(outputId), count: 1 };
                this.state.furnace.input = null;
                this.state.furnace.fuel = null;
                this.state.furnace.cookTime = 0;
            }
        } else {
            this.state.furnace.cookTime = 0;
        }
        this.updateFurnaceUI();
    }

    // ---------- ИНВЕНТАРЬ ----------
    addItem(item) {
        for (let i = 0; i < this.state.inventory.length; i++) {
            const slot = this.state.inventory[i];
            if (slot && slot.id === item.id) {
                slot.count += item.count || 1;
                this.updateInventoryUI();
                this.updateInventoryListUI();
                return true;
            }
        }
        for (let i = 0; i < this.state.inventory.length; i++) {
            if (this.state.inventory[i] === null) {
                this.state.inventory[i] = { ...item, count: item.count || 1 };
                this.updateInventoryUI();
                this.updateInventoryListUI();
                return true;
            }
        }
        return false;
    }

    removeItem(slotIndex, amount = 1) {
        const slot = this.state.inventory[slotIndex];
        if (!slot) return false;
        slot.count -= amount;
        if (slot.count <= 0) {
            this.state.inventory[slotIndex] = null;
        }
        this.updateInventoryUI();
        this.updateInventoryListUI();
        return true;
    }

    moveToCraftSlot(slotIndex, craftSlotIndex) {
        const invSlot = this.state.inventory[slotIndex];
        if (!invSlot) return;
        if (this.state.craftSlots[craftSlotIndex] !== null) return;
        this.state.craftSlots[craftSlotIndex] = { id: invSlot.id, name: invSlot.name, count: 1 };
        this.removeItem(slotIndex, 1);
        this.updateCraftUI();
        this.checkCraftRecipe();
    }

    takeFromCraftSlot(craftSlotIndex) {
        const craftItem = this.state.craftSlots[craftSlotIndex];
        if (!craftItem) return;
        if (this.addItem({ id: craftItem.id, name: craftItem.name, count: 1 })) {
            this.state.craftSlots[craftSlotIndex] = null;
            this.updateCraftUI();
            this.checkCraftRecipe();
        }
    }

    checkCraftRecipe() {
        const slots = this.state.craftSlots;
        const ingredients = slots.filter(s => s !== null).map(s => ({ id: s.id, count: 1 }));
        for (let recipe of RECIPES) {
            if (ingredients.length !== recipe.ingredients.length) continue;
            let match = true;
            let remaining = [...ingredients];
            for (let req of recipe.ingredients) {
                const index = remaining.findIndex(ing => ing.id === req.id);
                if (index === -1) {
                    match = false;
                    break;
                }
                remaining.splice(index, 1);
            }
            if (match) {
                this.state.craftResult = { ...recipe.result };
                this.updateCraftUI();
                return;
            }
        }
        this.state.craftResult = null;
        this.updateCraftUI();
    }

    takeCraftResult() {
        if (!this.state.craftResult) return;
        if (this.addItem({ id: this.state.craftResult.id, name: this.state.craftResult.name, count: this.state.craftResult.count })) {
            this.state.craftSlots = [null, null];
            this.state.craftResult = null;
            this.updateCraftUI();
        }
    }

    // ---------- ПЕЧЬ ----------
    toggleFurnace(open) {
        this.state.furnaceOpen = open;
        if (D.furnaceMenu) D.furnaceMenu.style.display = open ? 'flex' : 'none';
        if (open) {
            document.exitPointerLock();
            this.updateFurnaceUI();
        } else {
            this.ren.domElement.requestPointerLock();
        }
    }

    furnaceSlotClick(slotName) {
        const handSlot = this.state.slot - 1;
        const handItem = this.state.inventory[handSlot];
        if (!handItem) return;

        if (slotName === 'fuel' && this.isFuel(handItem.id)) {
            if (this.state.furnace.fuel) return;
            this.state.furnace.fuel = { id: handItem.id, name: handItem.name, count: 1 };
            this.removeItem(handSlot, 1);
        } else if (slotName === 'input' && this.isCookable(handItem.id)) {
            if (this.state.furnace.input) return;
            this.state.furnace.input = { id: handItem.id, name: handItem.name, count: 1 };
            this.removeItem(handSlot, 1);
        }
        this.updateFurnaceUI();
    }

    isFuel(id) {
        return id === 'wood' || id === 'planks' || id === 'stick';
    }

    isCookable(id) {
        return id === 'raw_beef' || id === 'raw_chicken' || id === 'mutton' || id === 'stone';
    }

    takeFurnaceOutput() {
        if (!this.state.furnace.output) return;
        if (this.addItem({ id: this.state.furnace.output.id, name: this.state.furnace.output.name, count: 1 })) {
            this.state.furnace.output = null;
            this.updateFurnaceUI();
        }
    }

    updateFurnaceUI() {
        if (D.fuelSlot) D.fuelSlot.innerText = this.state.furnace.fuel ? this.state.furnace.fuel.name : '';
        if (D.inputSlot) D.inputSlot.innerText = this.state.furnace.input ? this.state.furnace.input.name : '';
        if (D.outputSlot) D.outputSlot.innerText = this.state.furnace.output ? this.state.furnace.output.name : '';
        if (D.furnaceProgressBar) D.furnaceProgressBar.style.width = (this.state.furnace.cookTime / C.FURNACE_COOK_TIME * 100) + '%';
    }

    // ---------- ЕДА ----------
    isFood(id) {
        const foodItems = ['cooked_mutton', 'cooked_beef', 'cooked_chicken', 'mutton', 'raw_beef', 'raw_chicken', 'rotten_flesh'];
        return foodItems.includes(id);
    }

    consumeFood(slotIndex) {
        const item = this.state.inventory[slotIndex];
        if (!item) return;
        let hungerRestore = 0;
        if (item.id.includes('cooked')) hungerRestore = 20;
        else if (item.id.includes('raw') || item.id === 'mutton') hungerRestore = 10;
        else if (item.id === 'rotten_flesh') hungerRestore = 5;

        this.state.player.hunger = Math.min(this.state.player.maxHunger, this.state.player.hunger + hungerRestore);
        this.removeItem(slotIndex, 1);
        this.updateUI();
    }

    // ---------- UI ----------
    updateInventoryUI() {
        const slots = [D.s1, D.s2, D.s3, D.s4, D.s5, D.s6];
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            if (!slot) continue;
            const item = this.state.inventory[i];
            if (item) {
                slot.innerText = item.name + (item.count > 1 ? ` ${item.count}` : '');
            } else {
                slot.innerText = '';
            }
        }
    }

    updateInventoryListUI() {
        if (!D.iL) return;
        D.iL.innerHTML = '';
        for (let i = 0; i < this.state.inventory.length; i++) {
            const item = this.state.inventory[i];
            const div = document.createElement('div');
            div.className = 'inventory-slot';
            if (item) {
                div.innerText = `${item.name} x${item.count}`;
                div.dataset.index = i;
                div.addEventListener('click', () => {
                    if (this.state.craftSlots[0] === null) {
                        this.moveToCraftSlot(i, 0);
                    } else if (this.state.craftSlots[1] === null) {
                        this.moveToCraftSlot(i, 1);
                    }
                });
            } else {
                div.innerText = '(пусто)';
            }
            D.iL.appendChild(div);
        }
    }

    updateCraftUI() {
        if (D.craftSlot1) D.craftSlot1.innerText = this.state.craftSlots[0] ? this.state.craftSlots[0].name : '';
        if (D.craftSlot2) D.craftSlot2.innerText = this.state.craftSlots[1] ? this.state.craftSlots[1].name : '';
        if (D.craftResult) D.craftResult.innerText = this.state.craftResult ? this.state.craftResult.name : '';
    }

    updateUI() {
        if (D.uS) D.uS.innerText = this.state.score;
        if (D.hS) {
            D.hS.innerHTML = '';
            for (let i = 0; i < 10; i++) {
                const h = document.createElement('div');
                h.className = 'heart' + (this.state.player.health <= i * 2 ? ' empty' : '');
                D.hS.appendChild(h);
            }
        }
        if (D.hungerBar) D.hungerBar.style.width = (this.state.player.hunger / this.state.player.maxHunger * 100) + '%';
        this.updateInventoryUI();
    }

    initAchievements() {
        if (!D.aL) return;
        D.aL.innerHTML = '';
        this.state.achievements.forEach(a => {
            const c = document.createElement('div');
            c.id = 'ach-' + a.id;
            c.className = 'achievement-card' + (a.unlocked ? ' unlocked' : '');
            c.innerHTML = `<div class="achievement-name">${a.name}</div><div class="achievement-desc">${a.desc || ''}</div>`;
            D.aL.appendChild(c);
        });
    }

    checkAchievements() {
        const s = this.state.player.stats;
        this.state.achievements.forEach(a => {
            if (!a.unlocked && a.check(s)) {
                a.unlocked = true;
                if (D.tN) D.tN.innerText = a.name;
                if (D.aT) {
                    D.aT.classList.add('show');
                    setTimeout(() => D.aT.classList.remove('show'), 3000);
                }
                const card = document.getElementById('ach-' + a.id);
                if (card) card.classList.add('unlocked');
            }
        });
    }

    toggleAchievements() {
        this.state.menu = !this.state.menu;
        if (D.aM) D.aM.style.display = this.state.menu ? 'block' : 'none';
        if (this.state.menu) document.exitPointerLock();
        else this.ren.domElement.requestPointerLock();
    }

    damageMob(mob, dmg) {
        const d = mob.userData;
        d.hp -= dmg;
        mob.traverse(child => {
            if (child.isMesh && child.material.emissive) {
                child.material.emissive.setHex(0xff0000);
                setTimeout(() => child.material.emissive.setHex(0), 100);
            }
        });

        if (d.hp <= 0) {
            this.state.score += d.maxHp;
            this.state.player.stats.kills++;
            if (d.drops) {
                d.drops.forEach(drop => {
                    for (let i = 0; i < drop.count; i++) {
                        this.addItem({ id: drop.id, name: this.getItemName(drop.id) });
                    }
                });
            }
            this.scene.remove(mob);
            this.state.mobs = this.state.mobs.filter(m => m !== mob);
            this.spawnMob();
            this.checkAchievements();
            this.updateUI();
        }
    }

    getItemName(id) {
        const names = {
            'slimeball': 'Слизь',
            'mutton': 'Баранина',
            'wool': 'Шерсть',
            'raw_beef': 'Сырая говядина',
            'leather': 'Кожа',
            'rotten_flesh': 'Гнилая плоть',
            'bone': 'Кость',
            'arrow': 'Стрела',
            'string': 'Нить',
            'gunpowder': 'Порох',
            'feather': 'Перо',
            'raw_chicken': 'Сырая курица',
            'cooked_beef': 'Жареная говядина',
            'cooked_chicken': 'Жареная курица',
            'cooked_mutton': 'Жареная баранина',
            'planks': 'Доски',
            'stick': 'Палка',
            'stone_pickaxe': 'Каменная кирка',
            'stone_brick': 'Каменная кладка',
            'grass': 'Дёрн',
            'wood_axe': 'Деревянный топор',
            'slime_block': 'Слизневый блок',
            'mixed': 'Грязедерево',
            'wood_sword': 'Деревянный меч',
            'stone_brick_double': 'Двойная кладка',
            'wood': 'Древесина',
            'dirt': 'Земля',
            'stone': 'Камень',
            'bone_meal': 'Костная мука',
            'tnt': 'Динамит',
            'furnace': 'Печь'
        };
        return names[id] || id;
    }

    damagePlayer(amt) {
        if (this.state.player.health <= 0) return;
        let multiplier = 1.0;
        if (this.state.difficulty === 'easy') multiplier = 0.5;
        else if (this.state.difficulty === 'hard') multiplier = 2.0;
        amt *= multiplier;
        this.state.player.health -= amt;
        this.state.player.stats.damage += amt;
        this.cam.getWorldDirection(this.v.knock).setY(0).normalize().multiplyScalar(-0.5);
        this.cam.position.add(this.v.knock);
        this.updateUI();
        if (this.state.player.health <= 0) {
            this.state.player.health = 0;
            this.state.paused = true;
            document.exitPointerLock();
            if (D.dS) {
                D.dS.style.display = 'flex';
                D.dSt.innerHTML = `Счёт: ${this.state.score}<br>Убито: ${this.state.player.stats.kills}`;
            }
        }
    }

    breakOrAttack() {
        this.v.rayOrigin.copy(this.cam.position);
        this.cam.getWorldDirection(this.v.rayDir);
        const raycaster = new THREE.Raycaster(this.v.rayOrigin, this.v.rayDir, 0, C.INTERACT_DISTANCE);
        const intersects = raycaster.intersectObjects(this.scene.children, true);

        if (intersects.length === 0) return;

        const hit = intersects[0];
        const obj = hit.object;

        let mob = obj;
        while (mob && !mob.userData?.hp) mob = mob.parent;
        if (mob && mob.userData?.hp) {
            this.damageMob(mob, C.ATTACK_DAMAGE);
            return;
        }

        if (obj.userData?.type === 'block') {
            const dropType = obj.userData.drop;
            const dropName = this.getItemName(dropType);
            this.scene.remove(obj);
            const key = `${obj.position.x},${obj.position.y},${obj.position.z}`;
            this.blocksMap.delete(key);
            this.addItem({ id: dropType, name: dropName });
            return;
        }

        if (obj.userData?.type === 'treePart' || obj.userData?.type === 'tree') {
            let tree = obj;
            while (tree && tree.userData?.type !== 'tree') tree = tree.parent;
            if (tree && tree.userData?.type === 'tree') {
                this.scene.remove(tree);
                this.state.trees = this.state.trees.filter(t => t !== tree);
                this.addItem({ id: 'wood', name: this.getItemName('wood') });
                return;
            }
        }
    }

    placeBlock() {
        const slotIndex = this.state.slot - 1;
        const item = this.state.inventory[slotIndex];
        if (!item) return;

        this.v.rayOrigin.copy(this.cam.position);
        this.cam.getWorldDirection(this.v.rayDir);
        const raycaster = new THREE.Raycaster(this.v.rayOrigin, this.v.rayDir, 0, C.INTERACT_DISTANCE);
        const intersects = raycaster.intersectObjects(this.scene.children, true);
        if (intersects.length === 0) return;

        const hit = intersects[0];
        const normal = hit.face.normal.clone();
        const point = hit.point;
        let x = Math.round(point.x + normal.x * 0.5);
        let y = Math.round(point.y + normal.y * 0.5);
        let z = Math.round(point.z + normal.z * 0.5);

        const border = C.WORLD_BORDER;
        if (Math.abs(x) >= border || Math.abs(z) >= border) return;

        const playerBox = {
            minX: this.cam.position.x - 0.3, maxX: this.cam.position.x + 0.3,
            minY: this.cam.position.y - C.PLAYER_HEIGHT, maxY: this.cam.position.y,
            minZ: this.cam.position.z - 0.3, maxZ: this.cam.position.z + 0.3
        };
        if (x + 0.5 > playerBox.minX && x - 0.5 < playerBox.maxX &&
            y + 0.5 > playerBox.minY && y - 0.5 < playerBox.maxY &&
            z + 0.5 > playerBox.minZ && z - 0.5 < playerBox.maxZ) {
            return;
        }

        const key = `${x},${y},${z}`;
        if (this.blocksMap.has(key)) return;

        const colorMap = {
            'wood': 0x8b5a2b,
            'planks': 0xbd8a5a,
            'stick': 0xa57c5a,
            'stone_pickaxe': 0x7a7a7a,
            'stone_brick': 0x6b6b6b,
            'grass': 0x5a8b5a,
            'wood_axe': 0x8b5a2b,
            'slime_block': 0x55ff55,
            'cooked_mutton': 0xaa5533,
            'mixed': 0x9a7d5a,
            'wood_sword': 0x8b5a2b,
            'stone_brick_double': 0x555555,
            'dirt': 0x8b5a2b,
            'stone': 0x808080,
            'bone_meal': 0xeeeeee,
            'tnt': 0xff0000,
            'furnace': 0x888888
        };
        if (!colorMap[item.id]) return;

        const material = new THREE.MeshStandardMaterial({ color: colorMap[item.id] });
        const geo = new THREE.BoxGeometry(1, 1, 1);
        const block = new THREE.Mesh(geo, material);
        block.position.set(x, y, z);
        block.userData = { type: 'block', drop: item.id };
        this.scene.add(block);
        this.blocksMap.set(key, block);
        this.removeItem(slotIndex, 1);
    }

    // ---------- УПРАВЛЕНИЕ ----------
    initEvents() {
        window.addEventListener('keydown', e => this.onKeyDown(e));
        window.addEventListener('keyup', e => this.onKeyUp(e));
        window.addEventListener('mousemove', e => this.onMouseMove(e));
        window.addEventListener('mousedown', e => {
            if (e.button === 0) this.onMouseDown(e);
        });
        window.addEventListener('mousedown', e => {
            if (e.button === 2) this.onRightClick(e);
        });
        window.addEventListener('mouseup', e => this.onMouseUp(e));
        window.addEventListener('wheel', e => this.onWheel(e));
        window.addEventListener('resize', () => this.onResize());
        document.addEventListener('pointerlockchange', () => this.onLockChange());
        window.addEventListener('contextmenu', e => e.preventDefault());

        if (D.closeInv) D.closeInv.addEventListener('click', () => this.toggleInventory(false));
        if (D.closeSet) D.closeSet.addEventListener('click', () => this.toggleSettings(false));
        if (D.closeFurnace) D.closeFurnace.addEventListener('click', () => this.toggleFurnace(false));
        if (D.craftSlot1) D.craftSlot1.addEventListener('click', () => { if (this.state.craftSlots[0]) this.takeFromCraftSlot(0); });
        if (D.craftSlot2) D.craftSlot2.addEventListener('click', () => { if (this.state.craftSlots[1]) this.takeFromCraftSlot(1); });
        if (D.craftResult) D.craftResult.addEventListener('click', () => this.takeCraftResult());
        if (D.fuelSlot) D.fuelSlot.addEventListener('click', () => this.furnaceSlotClick('fuel'));
        if (D.inputSlot) D.inputSlot.addEventListener('click', () => this.furnaceSlotClick('input'));
        if (D.outputSlot) D.outputSlot.addEventListener('click', () => this.takeFurnaceOutput());

        if (D.sensInput) {
            D.sensInput.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                D.sensSpan.innerText = val.toFixed(1);
                this.mouseSensitivity = val;
            });
        }
        if (D.renderInput) {
            D.renderInput.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                D.renderSpan.innerText = val;
                this.cam.far = val * 5;
                this.cam.updateProjectionMatrix();
            });
        }
        if (D.qualitySelect) {
            D.qualitySelect.addEventListener('change', (e) => {
                this.performanceQuality = e.target.value;
            });
        }
    }

    onKeyDown(e) {
        if (e.code === 'Tab') {
            e.preventDefault();
            this.toggleAchievements();
            return;
        }
        if (e.code === 'KeyE') {
            e.preventDefault();
            this.toggleInventory(!this.state.inventoryOpen);
            return;
        }
        if (e.code === 'KeyP') {
            e.preventDefault();
            this.toggleSettings(!this.state.settingsOpen);
            return;
        }
        if (e.code === 'F5') {
            e.preventDefault();
            this.cameraMode = (this.cameraMode + 1) % 2;
            if (this.playerModel) {
                this.playerModel.visible = (this.cameraMode === 1);
            }
            if (this.hand) {
                this.hand.visible = (this.cameraMode === 0);
            }
            return;
        }
        if (this.state.paused || this.state.inventoryOpen || this.state.settingsOpen || this.state.furnaceOpen) return;
        const c = e.code;
        if (c === 'KeyW') this.state.input.f = 1;
        else if (c === 'KeyS') this.state.input.b = 1;
        else if (c === 'KeyA') this.state.input.l = 1;
        else if (c === 'KeyD') this.state.input.r = 1;
        else if (c === 'Space') this.state.input.j = 1;
        else if (c === 'ShiftLeft' || c === 'ShiftRight') { this.state.input.c = 1; e.preventDefault(); }
        else if (c === 'ControlLeft' || c === 'ControlRight') { this.state.input.s = 1; e.preventDefault(); }
        else if (c === 'Digit1') this.switchWeapon(1);
        else if (c === 'Digit2') this.switchWeapon(2);
        else if (c === 'Digit3') this.switchWeapon(3);
        else if (c === 'Digit4') this.switchWeapon(4);
        else if (c === 'Digit5') this.switchWeapon(5);
        else if (c === 'Digit6') this.switchWeapon(6);
    }

    onKeyUp(e) {
        if (this.state.paused || this.state.inventoryOpen || this.state.settingsOpen || this.state.furnaceOpen) return;
        const c = e.code;
        if (c === 'KeyW') this.state.input.f = 0;
        else if (c === 'KeyS') this.state.input.b = 0;
        else if (c === 'KeyA') this.state.input.l = 0;
        else if (c === 'KeyD') this.state.input.r = 0;
        else if (c === 'Space') this.state.input.j = 0;
        else if (c === 'ShiftLeft' || c === 'ShiftRight') { this.state.input.c = 0; e.preventDefault(); }
        else if (c === 'ControlLeft' || c === 'ControlRight') { this.state.input.s = 0; e.preventDefault(); }
    }

    onMouseMove(e) {
        if (this.state.paused || this.state.inventoryOpen || this.state.settingsOpen || this.state.furnaceOpen) return;
        this.state.player.yaw -= e.movementX * 0.002 * this.mouseSensitivity;
        this.state.player.pitch -= e.movementY * 0.002 * this.mouseSensitivity;
        this.state.player.pitch = Math.max(-1.4, Math.min(1.4, this.state.player.pitch));
    }

    onMouseDown(e) {
        if (!this.state.started) return;
        if (this.state.player.health <= 0 || this.state.paused || this.state.inventoryOpen || this.state.settingsOpen || this.state.furnaceOpen) return;
        this.breakOrAttack();
    }

    onRightClick(e) {
        e.preventDefault();
        if (!this.state.started) return;
        if (this.state.player.health <= 0 || this.state.paused || this.state.inventoryOpen || this.state.settingsOpen || this.state.furnaceOpen) return;

        const slotIndex = this.state.slot - 1;
        const item = this.state.inventory[slotIndex];
        if (!item) return;

        if (e.shiftKey) {
            if (this.isFood(item.id)) {
                this.consumeFood(slotIndex);
                return;
            }
        }

        if (item.id === 'furnace') {
            this.toggleFurnace(true);
            return;
        }

        this.placeBlock();
    }

    onMouseUp(e) {
        this.state.input.md = false;
    }

    onWheel(e) {
        if (this.state.paused || this.state.inventoryOpen || this.state.settingsOpen || this.state.furnaceOpen) return;
        const delta = e.deltaY > 0 ? 1 : -1;
        let newSlot = this.state.slot + delta;
        if (newSlot < 1) newSlot = 6;
        if (newSlot > 6) newSlot = 1;
        this.switchWeapon(newSlot);
    }

    switchWeapon(slot) {
        this.state.slot = slot;
        if (D.s1) D.s1.classList.toggle('selected', slot === 1);
        if (D.s2) D.s2.classList.toggle('selected', slot === 2);
        if (D.s3) D.s3.classList.toggle('selected', slot === 3);
        if (D.s4) D.s4.classList.toggle('selected', slot === 4);
        if (D.s5) D.s5.classList.toggle('selected', slot === 5);
        if (D.s6) D.s6.classList.toggle('selected', slot === 6);
    }

    onLockChange() {
        if (document.pointerLockElement === this.ren.domElement) {
            if (this.state.player.health <= 0) { document.exitPointerLock(); return; }
            this.state.paused = false;
            [D.mn, D.stS, D.pS, D.aM, D.iM, D.setM, D.furnaceMenu].forEach(el => { if (el) el.style.display = 'none'; });
            this.state.furnaceOpen = false;
            this.ensureSafePosition();
        } else {
            this.state.paused = true;
            if (this.state.started && !this.state.menu && !this.state.inventoryOpen && !this.state.settingsOpen && !this.state.furnaceOpen && this.state.player.health > 0) {
                if (D.pS) D.pS.style.display = 'flex';
            }
        }
    }

    onResize() {
        this.cam.aspect = innerWidth / innerHeight;
        this.cam.updateProjectionMatrix();
        this.ren.setSize(innerWidth, innerHeight);
    }

    toggleInventory(open) {
        this.state.inventoryOpen = open;
        if (D.iM) D.iM.style.display = open ? 'flex' : 'none';
        if (open) {
            this.updateInventoryListUI();
            this.updateCraftUI();
            document.exitPointerLock();
        } else {
            this.ensureSafePosition();
            this.ren.domElement.requestPointerLock();
        }
    }

    toggleSettings(open) {
        this.state.settingsOpen = open;
        if (D.setM) D.setM.style.display = open ? 'flex' : 'none';
        if (open) {
            if (D.pS) D.pS.style.display = 'none';
            if (D.iM) D.iM.style.display = 'none';
            document.exitPointerLock();
        } else {
            if (this.state.paused) {
                if (D.pS) D.pS.style.display = 'flex';
            } else {
                this.ren.domElement.requestPointerLock();
            }
        }
    }

    requestLock() {
        this.ren.domElement.requestPointerLock();
    }

    run() {
        const loop = () => {
            requestAnimationFrame(loop);
            const dt = Math.min(this.clock.getDelta(), 0.1);

            if (!this.state.paused && !this.state.inventoryOpen && !this.state.settingsOpen && !this.state.furnaceOpen) {
                this.updateDayNight(dt);
                this.update(dt);
                this.updateMobs(dt);
                this.updateUI();

                // Управление камерой в зависимости от режима
                if (this.cameraMode === 0) {
                    // Первое лицо: камера в позиции игрока, вращение от мыши
                    this.cam.rotation.set(this.state.player.pitch, this.state.player.yaw, 0, 'YXZ');
                } else {
                    // Третье лицо: камера позади игрока, смотрит на игрока
                    const targetPos = this.playerModel.position.clone().add(new THREE.Vector3(0, 1.6, 0)); // уровень глаз
                    const angle = this.state.player.yaw;
                    const offset = new THREE.Vector3(
                        Math.sin(angle) * C.THIRD_PERSON_DISTANCE,
                        C.THIRD_PERSON_HEIGHT,
                        Math.cos(angle) * C.THIRD_PERSON_DISTANCE
                    );
                    const camPos = targetPos.clone().sub(offset);
                    this.cam.position.copy(camPos);
                    this.cam.lookAt(targetPos);
                }
            }

            this.ren.render(this.scene, this.cam);
        };
        loop();
    }
}

// Запуск
const Engine = new Game();

window.addEventListener('mousedown', () => {}, { once: true });

window.requestLock = () => Engine.requestLock();
window.createNewWorld = () => Engine.createNewWorld();
window.exitToMenu = () => Engine.exitToMenu();