import type { SlidesPlugin } from '../types'
import { bibCompactor, bibFiltering } from './bibPlugins'
import { mathTokenClass } from './mathPlugins'
export { bibCompactor, bibFiltering } from './bibPlugins'
export { mathTokenClass } from './mathPlugins'

export function createPluginPack(packName: 'default'): SlidesPlugin[] {
    switch (packName) {
        case 'default':
        return [
            bibFiltering(),
            bibCompactor(),
            mathTokenClass(),
        ]
    default:
        throw new Error(`Unknown plugin set: ${packName}`)
    }
}
