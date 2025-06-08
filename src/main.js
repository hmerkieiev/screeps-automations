
const roles = {
    harvester: require('src/roles/harvester'),
    balancer: require('src/roles/balancer'),
    upgrader: require('src/roles/upgrader'),
    builder: require('src/roles/builder'),
    attacker: require('src/roles/attacker'),
    scout: require('src/roles/scout')
};

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

    require('src/utils/storage').buildMissingStorageNearSources(room);

    for (var i = 0; i < sources.length; i++) {
        var creepName = 'harvester-' + i + '-v' + HARVESTER_VERSION;
        if (Game.creeps[creepName] || (spawn.spawning && spawn.spawning.name === creepName)) continue;
        var result = spawn.spawnCreep([WORK, CARRY, MOVE], creepName, {
            memory: {
                role: 'harvester',
                sourceIndex: i,
                version: HARVESTER_VERSION
            }
        });
        if (result === OK) console.log('🔧 Spawning', creepName);
    }

    const balancerName = 'balancer-v' + HARVESTER_VERSION;
    if (!Game.creeps[balancerName]) {
        spawn.spawnCreep([CARRY, CARRY, MOVE, MOVE], balancerName, {
            memory: { role: 'balancer', version: HARVESTER_VERSION }
        });
    }

    for (let i = 0; i < UPGRADER_COUNT; i++) {
        let name = `upgrader-${i}-v${HARVESTER_VERSION}`;
        if (!Game.creeps[name]) {
            spawn.spawnCreep([WORK, CARRY, MOVE], name, {
                memory: { role: 'upgrader', index: i, version: HARVESTER_VERSION }
            });
        }
    }

    for (let i = 0; i < BUILDER_COUNT; i++) {
        let name = `builder-${i}-v${HARVESTER_VERSION}`;
        if (!Game.creeps[name]) {
            spawn.spawnCreep([WORK, CARRY, MOVE], name, {
                memory: { role: 'builder', index: i, version: HARVESTER_VERSION }
            });
        }
    }

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

    for (let i = 0; i < SCOUT_COUNT; i++) {
        const name = `scout-${i}-v${HARVESTER_VERSION}`;
        if (!Game.creeps[name]) {
            spawn.spawnCreep([WORK, CARRY, MOVE], name, {
                memory: { role: 'scout', index: i, version: HARVESTER_VERSION }
            });
        }
    }

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (roles[creep.memory.role]) {
            roles[creep.memory.role](creep);
        }
    }
};
