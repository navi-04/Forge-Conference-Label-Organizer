import Resolver from '@forge/resolver';
import api, { route } from '@forge/api';

const resolver = new Resolver();

// Get the current space key - either from context or fallback to API call
const getSpaceKey = async (context) => {
  try {
    // First check if context has spaceKey (when app is running in a space)
    if (context && context.spaceKey) {
      console.log(`Using space key from context: ${context.spaceKey}`);
      return context.spaceKey;
    }
    
    // If no context spaceKey, try the API
    console.log('No space key in context, fetching spaces list...');
    const spacesResponse = await api.asApp().requestConfluence(route`/wiki/rest/api/space`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const spaces = await spacesResponse.json();
    console.log(`Found ${spaces.results ? spaces.results.length : 0} spaces`);
    
    if (spaces && spaces.results && spaces.results.length > 0) {
      console.log(`Using first space: ${spaces.results[0].key}`);
      return spaces.results[0].key;
    }
    
    // Fallback for when no spaces are found
    console.log('No spaces found, using fallback space key "DEV"');
    return 'DEV';
    
  } catch (error) {
    console.error('Error in getSpaceKey:', error.message);
    // Always provide a fallback value
    console.log('Using fallback space key "DEV" due to error');
    return 'DEV';
  }
};

// Get all labels used in a space
resolver.define('getLabels', async ({ context }) => {
  try {
    const spaceKey = await getSpaceKey(context);
    
    // Get all pages in the space
    const pagesResponse = await api.asApp().requestConfluence(
      route`/wiki/rest/api/content?type=page&spaceKey=${spaceKey}&expand=metadata.labels&limit=100`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    const pagesData = await pagesResponse.json();
    
    // Get all blog posts in the space
    const blogPostsResponse = await api.asApp().requestConfluence(
      route`/wiki/rest/api/content?type=blogpost&spaceKey=${spaceKey}&expand=metadata.labels&limit=100`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    const blogPostsData = await blogPostsResponse.json();
    
    // Combine and process the labels
    const labelMap = {};
    
    // Process page labels
    if (pagesData && pagesData.results) {
      pagesData.results.forEach(page => {
        if (page.metadata && page.metadata.labels && page.metadata.labels.results) {
          page.metadata.labels.results.forEach(label => {
            if (!labelMap[label.name]) {
              labelMap[label.name] = { name: label.name, pageCount: 0, blogPostCount: 0 };
            }
            labelMap[label.name].pageCount++;
          });
        }
      });
    }
    
    // Process blog post labels
    if (blogPostsData && blogPostsData.results) {
      blogPostsData.results.forEach(post => {
        if (post.metadata && post.metadata.labels && post.metadata.labels.results) {
          post.metadata.labels.results.forEach(label => {
            if (!labelMap[label.name]) {
              labelMap[label.name] = { name: label.name, pageCount: 0, blogPostCount: 0 };
            }
            labelMap[label.name].blogPostCount++;
          });
        }
      });
    }
    
    // Convert to array and add totalCount for sorting
    const labels = Object.values(labelMap).map(label => ({
      ...label,
      totalCount: label.pageCount + label.blogPostCount
    }));
    
    return labels;
  } catch (error) {
    console.error('Error fetching labels:', error);
    throw error;
  }
});

// Get all pages in a space
resolver.define('getPages', async ({ context }) => {
  try {
    const spaceKey = await getSpaceKey(context);
    
    const response = await api.asApp().requestConfluence(
      route`/wiki/rest/api/content?type=page&spaceKey=${spaceKey}&status=current&limit=100`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    const data = await response.json();
    
    if (data && data.results) {
      return data.results.map(page => ({
        id: page.id,
        title: page.title
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error;
  }
});

// Add a label to selected pages
resolver.define('addLabel', async (req) => {
  const { labelName, pageIds } = req;
  
  try {
    for (const pageId of pageIds) {
      await api.asApp().requestConfluence(
        route`/wiki/rest/api/content/${pageId}/label`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([{ name: labelName }])
        }
      );
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error adding label:', error);
    throw error;
  }
});

// Delete labels from all content
resolver.define('deleteLabels', async (req) => {
  const { labels } = req;
  const { context } = req;
  
  try {
    const spaceKey = await getSpaceKey(context);
    
    // Get all content with these labels
    for (const labelName of labels) {
      // Get content with this label
      const response = await api.asApp().requestConfluence(
        route`/wiki/rest/api/content?label=${labelName}&spaceKey=${spaceKey}&limit=100`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.results) {
        // Remove the label from each content item
        for (const content of data.results) {
          await api.asApp().requestConfluence(
            route`/wiki/rest/api/content/${content.id}/label/${labelName}`,
            {
              method: 'DELETE',
              headers: {
                'Accept': 'application/json'
              }
            }
          );
        }
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting labels:', error);
    throw error;
  }
});

// Merge labels
resolver.define('mergeLabels', async (req) => {
  const { sourceLabels, targetLabel } = req;
  const { context } = req;
  
  try {
    const spaceKey = await getSpaceKey(context);
    
    // For each source label, find content and add the target label
    for (const sourceLabel of sourceLabels) {
      if (sourceLabel === targetLabel) continue;
      
      // Get content with this source label
      const response = await api.asApp().requestConfluence(
        route`/wiki/rest/api/content?label=${sourceLabel}&spaceKey=${spaceKey}&limit=100`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.results) {
        for (const content of data.results) {
          // Add the target label
          await api.asApp().requestConfluence(
            route`/wiki/rest/api/content/${content.id}/label`,
            {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify([{ name: targetLabel }])
            }
          );
          
          // Remove the source label
          await api.asApp().requestConfluence(
            route`/wiki/rest/api/content/${content.id}/label/${sourceLabel}`,
            {
              method: 'DELETE',
              headers: {
                'Accept': 'application/json'
              }
            }
          );
        }
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error merging labels:', error);
    throw error;
  }
});


export const handler = resolver.getDefinitions();
