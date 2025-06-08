module.exports = function (creep) {
    // Якщо у кріпа ще є вільне місце
    if (creep.store.getFreeCapacity() > 0) {
        const sources = creep.room.find(FIND_SOURCES);
        const source = sources[creep.memory.sourceIndex] || sources[0];

        if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
            creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
        return;
    }

    // Якщо кріп повністю заповнений, шукаємо куди вигрузити енергію
    const targets = creep.room.find(FIND_STRUCTURES, {
        filter: structure =>
            (structure.structureType === STRUCTURE_EXTENSION ||
             structure.structureType === STRUCTURE_SPAWN ||
             structure.structureType === STRUCTURE_TOWER) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
    });

    //.. Якщо є куди віддати енергію — йдемо туди
    if (targets.length > 0) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
        return;
    }

    // Якщо все заповнено — спробуй викинути у storage (якщо є)
    if (creep.room.storage) {
        if (creep.transfer(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.storage, { visualizePathStyle: { stroke: '#ffffff' } });
        }
        return;
    }

    // Якщо взагалі нема куди — стань біля спавна
    creep.moveTo(Game.spawns['Spawn1']);
};
