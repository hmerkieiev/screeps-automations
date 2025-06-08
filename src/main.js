console.log('✅ GitHub code synced and running!');

// Debug-load roles
let roles = {};
try {
    roles.harvester = require('harvester');
    console.log('✅ harvester module loaded');
} catch (e) {
    console.log('❌ Error loading harvester:', e.message);
}
try {
    roles.balancer = require('balancer');
    console.log('✅ balancer module loaded');
} catch (e) {
    console.log('❌ Error loading balancer:', e.message);
}
try {
    roles.upgrader = require('upgrader');
    console.log('✅ upgrader module loaded');
} catch (e) {
    console.log('❌ Error loading upgrader:', e.message);
}
try {
    roles.builder = require('builder');
    console.log('✅ builder module loaded');
} catch (e) {
    console.log('❌ Error loading builder:', e.message);
}
try {
    roles.attacker = require('attacker');
    console.log('✅ attacker module loaded');
} catch (e) {
    console.log('❌ Error loading attacker:', e.message);
}
try {
    roles.scout = require('scout');
    console.log('✅ scout module loaded');
} catch (e) {
    console.log('❌ Error loading scout:', e.message);
}

// Debug-load utils
let storageUtils = null;
try {
    storageUtils = require('storage');
    console.log('✅ storage utils module loaded');
} catch (e) {
    console.log('❌ Error loading storage utils:', e.message);
}

// === Main logic ===
const HARVESTER_VERSION = 4;
const UPGRADER_COUNT = 1;
const BUILDER_COUNT = 0;
const ATTACKER_COUNT = 1;
const SCOUT_COUNT = 1;

module.exports.loop = function () {
    for (const name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('🧹 Cleared memory of', name);
        }
    }

    const spawn = Game.spawns['Spawn1'];
    const room = spawn.room;
    const sources = room.find(FIND_SOURCES);

    if (storageUtils && typeof storageUtils.buildMissingStorageNearSources === 'function') {
        storageUtils.buildMissingStorageNearSources(room);
    } else {
        console.log('⚠️ buildMissingStorageNearSources not available');
    }

    // Harvesters
    for (let i = 0; i < sources.length; i++) {
        let name = `harvester-${i}-v${HARVESTER_VERSION}`;
        if (!Game.creeps[name] && (!spawn.spawning || spawn.spawning.name !== name)) {
            let result = spawn.spawnCreep([WORK, CARRY, MOVE], name, {
                memory: { role: 'harvester', sourceIndex: i, version: HARVESTER_VERSION }
            });
            if (result === OK) console.log('🔧 Spawning', name);
        }
    }

    // Balancer
    let balancerName = `balancer-v${HARVESTER_VERSION}`;
    if (!Game.creeps[balancerName]) {
        spawn.spawnCreep([CARRY, CARRY, MOVE, MOVE], balancerName, {
            memory: { role: 'balancer', version: HARVESTER_VERSION }
        });
    }

    // Upgraders
    for (let i = 0; i < UPGRADER_COUNT; i++) {
        let name = `upgrader-${i}-v${HARVESTER_VERSION}`;
        if (!Game.creeps[name]) {
            spawn.spawnCreep([WORK, CARRY, MOVE], name, {
                memory: { role: 'upgrader', index: i, version: HARVESTER_VERSION }
            });
        }
    }

    // Builders
    for (let i = 0; i < BUILDER_COUNT; i++) {
        let name = `builder-${i}-v${HARVESTER_VERSION}`;
        if (!Game.creeps[name]) {
            spawn.spawnCreep([WORK, CARRY, MOVE], name, {
                memory: { role: 'builder', index: i, version: HARVESTER_VERSION }
            });
        }
    }

    // Attackers
    for (let i = 0; i < ATTACKER_COUNT; i++) {
        let name = `attacker-${i}-v${HARVESTER_VERSION}`;
        if (!Game.creeps[name]) {
            const energy = room.energyAvailable;
            let body = energy >= 260 ? [MOVE, MOVE, ATTACK, ATTACK] : energy >= 130 ? [MOVE, ATTACK] : null;
            if (!body) continue;
            spawn.spawnCreep(body, name, {
                memory: { role: 'attacker', index: i, version: HARVESTER_VERSION }
            });
        }
    }

    // Scouts
    for (let i = 0; i < SCOUT_COUNT; i++) {
        const name = `scout-${i}-v${HARVESTER_VERSION}`;
        if (!Game.creeps[name]) {
            spawn.spawnCreep([WORK, CARRY, MOVE], name, {
                memory: { role: 'scout', index: i, version: HARVESTER_VERSION }
            });
        }
    }

    // Run creeps
    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        const role = creep.memory.role;
        if (roles[role]) {
            roles[role](creep);
        } else {
            console.log(`⚠️ No role implementation for: ${role}`);
        }
    }
};
