/* tslint:disable */
import * as _ from 'lodash'

// Resolves the tabSection property holding a tab's sections:
// explicit `key`, else camelCased name + 'Tab' ("Core Areas" -> "coreAreasTab")
export function getTabSectionDataKey(tab: any): string {
    return tab?.key || `${_.camelCase(tab?.name)}Tab`
}
