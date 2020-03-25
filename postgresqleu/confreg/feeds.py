from django.contrib.syndication.views import Feed
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.template.defaultfilters import slugify

from .models import Conference
from .util import get_conference_or_404

from postgresqleu.util.db import exec_to_dict


class LatestEvents(Feed):
    title = "Events - %s" % settings.ORG_NAME
    link = "/"
    description = "Upcoming events from %s" % settings.ORG_NAME
    description_template = "events/rssevent.html"

    def items(self):
        return Conference.objects.filter(promoactive=True, enddate__gte=timezone.now())

    def item_link(self, conference):
        return "%s/events/%s/" % (settings.SITEBASE, conference.urlname)


class ConferenceNewsFeed(Feed):
    description_template = "pieces/news_description.html"

    def get_object(self, request, what):
        return get_conference_or_404(what)

    def title(self, obj):
        return "News - {0}".format(obj.conferencename)

    def description(self, obj):
        return "Latest news from {0}".format(obj.conferencename)

    def link(self, obj):
        return obj.confurl

    def items(self, obj):
        return exec_to_dict("""SELECT n.id, c.urlname, datetime, c.conferencename || ' - ' || title AS title, summary
FROM confreg_conferencenews n
INNER JOIN confreg_conference c ON c.id=conference_id
WHERE datetime<CURRENT_TIMESTAMP AND inrss AND conference_id=%(cid)s
ORDER BY datetime DESC LIMIT 10""", {
            'cid': obj.id,
        })

    def item_title(self, news):
        return news['title']

    def item_link(self, news):
        return '{0}/events/{1}/news/{2}-{3}/'.format(
            settings.SITEBASE,
            news['urlname'],
            slugify(news['title']),
            news['id'],
        )

    def item_pubdate(self, news):
        return news['datetime']
