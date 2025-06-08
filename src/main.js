console.log('✅ GitHub code synced and running!!!!');

// Debug-load roles
var roles = {};
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

var storageUtils = null;
try {
    storageUtils = require('storage');
    console.log('✅ storage utils module loaded');
} catch (e) {
    console.log('❌ Error loading storage utils:', e.message);
}

var HARVESTER_VERSION = 4;
var UPGRADER_COUNT = 0;
var BUILDER_COUNT = 0;
var ATTACKER_COUNT = 0;
var SCOUT_COUNT = 0;

module.exports.loop = function () {
    console.log('🔄 --- New game tick ---');

    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('🧹 Cleared memory of', name);
        }
    }

    var spawns = Object.keys(Game.spawns);
    if (spawns.length === 0) {
        console.log('❌ No spawns found');
        return;
    }

    var spawn = Game.spawns[spawns[0]];
    var room = spawn.room;
    var sources = room.find(FIND_SOURCES);
    console.log('🏠 Using spawn:', spawn.name, 'in room:', room.name);
    console.log('🌞 Found', sources.length, 'sources');

    if (storageUtils && typeof storageUtils.buildMissingStorageNearSources === 'function') {
        storageUtils.buildMissingStorageNearSources(room);
    } else {
        console.log('⚠️ buildMissingStorageNearSources not available');
    }

    for (var i = 0; i < sources.length; i++) {
        var name = 'harvester-' + i + '-v' + HARVESTER_VERSION;
        if (!Game.creeps[name] && (!spawn.spawning || spawn.spawning.name !== name)) {
            var result = spawn.spawnCreep([WORK, CARRY, MOVE], name, {
                memory: { role: 'harvester', sourceIndex: i, version: HARVESTER_VERSION }
            });
            if (result === OK) {
                console.log('🔧 Spawning', name);
            } else {
                console.log('❌ Failed to spawn', name, '-', result);
            }
        }
    }

    var balancerName = 'balancer-v' + HARVESTER_VERSION;
    if (!Game.creeps[balancerName]) {
        var result = spawn.spawnCreep([CARRY, CARRY, MOVE, MOVE], balancerName, {
            memory: { role: 'balancer', version: HARVESTER_VERSION }
        });
        if (result === OK) {
            console.log('🔧 Spawning', balancerName);
        } else {
            console.log('❌ Failed to spawn', balancerName, '-', result);
        }
    }

    for (var i = 0; i < UPGRADER_COUNT; i++) {
        var name = 'upgrader-' + i + '-v' + HARVESTER_VERSION;
        if (!Game.creeps[name]) {
            var result = spawn.spawnCreep([WORK, CARRY, MOVE], name, {
                memory: { role: 'upgrader', index: i, version: HARVESTER_VERSION }
            });
            if (result === OK) {
                console.log('🔧 Spawning', name);
            } else {
                console.log('❌ Failed to spawn', name, '-', result);
            }
        }
    }

    for (var i = 0; i < BUILDER_COUNT; i++) {
        var name = 'builder-' + i + '-v' + HARVESTER_VERSION;
        if (!Game.creeps[name]) {
            var result = spawn.spawnCreep([WORK, CARRY, MOVE], name, {
                memory: { role: 'builder', index: i, version: HARVESTER_VERSION }
            });
            if (result === OK) {
                console.log('🔧 Spawning', name);
            } else {
                console.log('❌ Failed to spawn', name, '-', result);
            }
        }
    }

    for (var i = 0; i < ATTACKER_COUNT; i++) {
        var name = 'attacker-' + i + '-v' + HARVESTER_VERSION;
        if (!Game.creeps[name]) {
            var energy = room.energyAvailable;
            var body = energy >= 260 ? [MOVE, MOVE, ATTACK, ATTACK] : energy >= 130 ? [MOVE, ATTACK] : null;
            if (body) {
                var result = spawn.spawnCreep(body, name, {
                    memory: { role: 'attacker', index: i, version: HARVESTER_VERSION }
                });
                if (result === OK) {
                    console.log('🔧 Spawning', name);
                } else {
                    console.log('❌ Failed to spawn', name, '-', result);
                }
            } else {
                console.log('⚠️ Not enough energy to spawn attacker');
            }
        }
    }

    for (var i = 0; i < SCOUT_COUNT; i++) {
        var name = 'scout-' + i + '-v' + HARVESTER_VERSION;
        if (!Game.creeps[name]) {
            var result = spawn.spawnCreep([WORK, CARRY, MOVE], name, {
                memory: { role: 'scout', index: i, version: HARVESTER_VERSION }
            });
            if (result === OK) {
                console.log('🔧 Spawning', name);
            } else {
                console.log('❌ Failed to spawn', name, '-', result);
            }
        }
    }

    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        var role = creep.memory.role;
        if (roles[role]) {
            try {
                roles[role](creep);
            } catch (e) {
                console.log('❌ Error running creep', name, '-', e.message);
            }
        } else {
            console.log('⚠️ No role implementation for:', role, 'on creep', name);
        }
    }
};
